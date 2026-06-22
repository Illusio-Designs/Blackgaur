'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');
const { uploadFile } = require('../services/s3.service');

const SORTABLE = ['createdAt', 'amount', 'expenseDate', 'status', 'expenseType'];
const INCLUDABLE = ['trip', 'driver', 'approver'];

const createSchema = z.object({
  trip_id: z.coerce.number().int().positive().optional().nullable(),
  expense_type: z.enum(['fuel', 'toll', 'loading', 'unloading', 'repair', 'bata', 'halting', 'misc']),
  amount: z.coerce.number().positive(),
  description: z.string().max(200).optional(),
  expense_date: z.coerce.date().optional(),
});

const rejectSchema = z.object({ reason: z.string().min(1).max(2000) });
const approveSchema = z.object({ note: z.string().max(2000).optional() });

/** GET /expenses */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE, includable: INCLUDABLE, dateField: 'expenseDate' });
  const where = { ...q.where };
  const filters = { ...q.filtersApplied };

  if (req.permissionScope === 'own') where.driverId = req.user.userId;

  if (raw.status) {
    const arr = Array.isArray(raw.status) ? raw.status : String(raw.status).split(',');
    where.status = { in: arr };
    filters.status = arr;
  }
  if (raw.trip_id) {
    where.tripId = Number(raw.trip_id);
    filters.trip_id = Number(raw.trip_id);
  }
  if (raw.driver_id) {
    where.driverId = Number(raw.driver_id);
    filters.driver_id = Number(raw.driver_id);
  }
  if (raw.expense_type) {
    const arr = Array.isArray(raw.expense_type) ? raw.expense_type : String(raw.expense_type).split(',');
    where.expenseType = { in: arr };
    filters.expense_type = arr;
  }
  if (raw.is_fastag_synced !== undefined) {
    where.isFastagSynced = raw.is_fastag_synced === 'true' || raw.is_fastag_synced === true;
    filters.is_fastag_synced = where.isFastagSynced;
  }
  if (raw.is_fuelcard_synced !== undefined) {
    where.isFuelcardSynced = raw.is_fuelcard_synced === 'true' || raw.is_fuelcard_synced === true;
    filters.is_fuelcard_synced = where.isFuelcardSynced;
  }
  const amount = {};
  if (raw.min_amount) {
    amount.gte = Number(raw.min_amount);
    filters.min_amount = Number(raw.min_amount);
  }
  if (raw.max_amount) {
    amount.lte = Number(raw.max_amount);
    filters.max_amount = Number(raw.max_amount);
  }
  if (Object.keys(amount).length) where.amount = amount;

  const [total, items] = await Promise.all([
    prisma.tripExpense.count({ where }),
    prisma.tripExpense.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** POST /expenses (multipart with optional receipt) */
async function create(req, res) {
  const b = req.body;
  let receiptUrl = null;
  if (req.file) {
    const uploaded = await uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: 'receipts',
    });
    receiptUrl = uploaded.url;
  }

  // Drivers may only file expenses against their own trips.
  let driverId = req.user.userId;
  if (b.trip_id) {
    const trip = await prisma.trip.findFirst({ where: { id: Number(b.trip_id), deletedAt: null } });
    if (!trip) throw AppError.badRequest('Trip not found');
    if (req.permissionScope === 'own' && trip.driverId !== req.user.userId) {
      throw AppError.forbidden('You can only add expenses to your own trips');
    }
    if (trip.driverId) driverId = trip.driverId;
  }

  const expense = await prisma.tripExpense.create({
    data: {
      tripId: b.trip_id ? Number(b.trip_id) : null,
      driverId,
      expenseType: b.expense_type,
      amount: b.amount,
      description: b.description || null,
      expenseDate: b.expense_date || new Date(),
      receiptUrl,
      status: 'pending',
    },
  });
  await auditLog(req, 'expense.submitted', 'trip_expenses', expense.id, null, expense);
  return ok(res, expense, { status: 201 });
}

/** PATCH /expenses/:id/approve */
async function approve(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.tripExpense.findUnique({ where: { id } });
  if (!before) throw AppError.notFound('Expense not found');
  if (before.status === 'approved') throw AppError.conflict('Expense already approved');

  const expense = await prisma.tripExpense.update({
    where: { id },
    data: {
      status: 'approved',
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      rejectedReason: null,
      ...(req.body && req.body.note ? { description: before.description } : {}),
    },
  });
  await auditLog(req, 'expense.approved', 'trip_expenses', id, before, expense);
  return ok(res, expense);
}

/** PATCH /expenses/:id/reject */
async function reject(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.tripExpense.findUnique({ where: { id } });
  if (!before) throw AppError.notFound('Expense not found');

  const expense = await prisma.tripExpense.update({
    where: { id },
    data: {
      status: 'rejected',
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      rejectedReason: req.body.reason,
    },
  });
  await auditLog(req, 'expense.rejected', 'trip_expenses', id, before, expense);
  return ok(res, expense);
}

/** GET /expenses/summary */
async function summary(req, res) {
  const raw = req.validatedQuery || req.query;
  const groupBy = ['type', 'trip', 'driver', 'month'].includes(raw.group_by) ? raw.group_by : 'type';
  const where = {};
  const dateFilter = {};
  if (raw.from_date) dateFilter.gte = new Date(raw.from_date);
  if (raw.to_date) dateFilter.lte = new Date(raw.to_date);
  if (Object.keys(dateFilter).length) where.expenseDate = dateFilter;

  let groups;
  if (groupBy === 'type') {
    groups = await prisma.tripExpense.groupBy({
      by: ['expenseType'],
      where,
      _sum: { amount: true },
      _count: true,
    });
    groups = groups.map((g) => ({ key: g.expenseType, total: g._sum.amount, count: g._count }));
  } else if (groupBy === 'trip') {
    const raw2 = await prisma.tripExpense.groupBy({ by: ['tripId'], where, _sum: { amount: true }, _count: true });
    groups = raw2.map((g) => ({ key: g.tripId, total: g._sum.amount, count: g._count }));
  } else if (groupBy === 'driver') {
    const raw2 = await prisma.tripExpense.groupBy({ by: ['driverId'], where, _sum: { amount: true }, _count: true });
    groups = raw2.map((g) => ({ key: g.driverId, total: g._sum.amount, count: g._count }));
  } else {
    // month — aggregate in JS since Prisma groupBy can't bucket by month portably.
    const rows = await prisma.tripExpense.findMany({ where, select: { expenseDate: true, amount: true } });
    const map = {};
    for (const r of rows) {
      const key = r.expenseDate ? r.expenseDate.toISOString().slice(0, 7) : 'unknown';
      map[key] = map[key] || { key, total: 0, count: 0 };
      map[key].total += Number(r.amount);
      map[key].count += 1;
    }
    groups = Object.values(map);
  }

  return ok(res, { group_by: groupBy, groups }, { filters_applied: { from_date: raw.from_date, to_date: raw.to_date } });
}

module.exports = {
  schemas: { createSchema, rejectSchema, approveSchema },
  list,
  create,
  approve,
  reject,
  summary,
};
