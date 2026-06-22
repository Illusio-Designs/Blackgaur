'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');
const { userHasPermission } = require('../middleware/hasPermission');
const crypto = require('../lib/crypto');
const hpcl = require('../services/fuel-card/hpcl.service');
const iocl = require('../services/fuel-card/iocl.service');
const sync = require('../services/fuel-card/fuelSync.service');

const CARD_SORTABLE = ['createdAt', 'balance', 'balanceSyncedAt', 'cardType'];
const TXN_SORTABLE = ['transactionAt', 'amount', 'quantityLtr', 'syncedAt'];

const createSchema = z.object({
  card_number: z.string().min(4).max(25),
  card_type: z.enum(['hpcl_fleetcard', 'iocl_xtrarewards', 'bpcl_smartfleet', 'shell', 'custom']),
  vehicle_id: z.coerce.number().int().positive().optional().nullable(),
  driver_id: z.coerce.number().int().positive().optional().nullable(),
  monthly_limit: z.coerce.number().nonnegative().optional(),
  per_txn_limit: z.coerce.number().nonnegative().optional(),
  allowed_products: z.array(z.string()).optional(),
  api_card_id: z.string().max(80).optional(),
  expiry_date: z.coerce.date().optional(),
  issued_at: z.coerce.date().optional(),
});

const patchSchema = z.object({
  vehicle_id: z.coerce.number().int().positive().optional().nullable(),
  driver_id: z.coerce.number().int().positive().optional().nullable(),
  monthly_limit: z.coerce.number().nonnegative().optional(),
  per_txn_limit: z.coerce.number().nonnegative().optional(),
  is_active: z.coerce.boolean().optional(),
});

const blockSchema = z.object({ reason: z.string().min(1).max(200) });
const syncSchema = z.object({
  from_date: z.coerce.date().optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
});

/** Map raw card to safe response: card number always masked; last4 only for admin. */
function presentCard(card, req) {
  const plain = crypto.decrypt(card.cardNumber);
  const isAdmin = userHasPermission(req, 'fuel_cards', 'create'); // admin has CRUD
  return {
    id: card.id,
    cardNumber: crypto.mask(plain || ''),
    cardLast4: isAdmin ? card.cardLast4 : undefined,
    cardType: card.cardType,
    vehicleId: card.vehicleId,
    driverId: card.driverId,
    balance: card.balance,
    balanceSyncedAt: card.balanceSyncedAt,
    monthlyLimit: card.monthlyLimit,
    perTxnLimit: card.perTxnLimit,
    allowedProducts: card.allowedProducts,
    isActive: card.isActive,
    isBlocked: card.isBlocked,
    blockReason: card.blockReason,
    expiryDate: card.expiryDate,
    issuedAt: card.issuedAt,
    createdAt: card.createdAt,
    vehicle: card.vehicle,
    driver: card.driver,
  };
}

function issuerClient(cardType) {
  return cardType === 'iocl_xtrarewards' ? iocl : hpcl;
}

/** GET /fuel-cards */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: CARD_SORTABLE });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };
  if (raw.vehicle_id) {
    where.vehicleId = Number(raw.vehicle_id);
    filters.vehicle_id = Number(raw.vehicle_id);
  }
  if (raw.driver_id) {
    where.driverId = Number(raw.driver_id);
    filters.driver_id = Number(raw.driver_id);
  }
  if (raw.card_type) {
    where.cardType = String(raw.card_type);
    filters.card_type = raw.card_type;
  }
  if (raw.is_active !== undefined) {
    where.isActive = raw.is_active === 'true' || raw.is_active === true;
    filters.is_active = where.isActive;
  }

  let [total, items] = await Promise.all([
    prisma.fuelCard.count({ where }),
    prisma.fuelCard.findMany({
      where,
      orderBy: q.orderBy,
      skip: q.skip,
      take: q.take,
      include: {
        vehicle: { select: { id: true, registrationNo: true } },
        driver: { select: { id: true, name: true } },
      },
    }),
  ]);

  if (raw.low_balance === 'true' || raw.low_balance === true) {
    items = items.filter((c) => c.monthlyLimit && Number(c.balance) < Number(c.monthlyLimit) * 0.1);
    filters.low_balance = true;
  }

  return ok(res, items.map((c) => presentCard(c, req)), {
    meta: buildMeta(total, q.page, q.limit),
    filters_applied: filters,
  });
}

/** GET /fuel-cards/:id */
async function getOne(req, res) {
  const card = await prisma.fuelCard.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
    include: {
      vehicle: { select: { id: true, registrationNo: true } },
      driver: { select: { id: true, name: true } },
    },
  });
  if (!card) throw AppError.notFound('Fuel card not found');
  return ok(res, presentCard(card, req));
}

/** POST /fuel-cards */
async function create(req, res) {
  const b = req.body;
  const card = await prisma.fuelCard.create({
    data: {
      cardNumber: crypto.encrypt(b.card_number),
      cardLast4: crypto.last4(b.card_number),
      cardType: b.card_type,
      vehicleId: b.vehicle_id || null,
      driverId: b.driver_id || null,
      monthlyLimit: b.monthly_limit ?? null,
      perTxnLimit: b.per_txn_limit ?? null,
      allowedProducts: b.allowed_products || undefined,
      apiCardId: b.api_card_id || null,
      expiryDate: b.expiry_date || null,
      issuedAt: b.issued_at || null,
    },
  });
  await auditLog(req, 'fuel_card.created', 'fuel_cards', card.id, null, { ...card, cardNumber: '[encrypted]' }, crypto.mask(b.card_number));
  return ok(res, presentCard(card, req), { status: 201 });
}

/** PATCH /fuel-cards/:id (assign / limits / active) */
async function patch(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.fuelCard.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Fuel card not found');
  const b = req.body;
  const data = {};
  if (b.vehicle_id !== undefined) data.vehicleId = b.vehicle_id || null;
  if (b.driver_id !== undefined) data.driverId = b.driver_id || null;
  if (b.monthly_limit !== undefined) data.monthlyLimit = b.monthly_limit;
  if (b.per_txn_limit !== undefined) data.perTxnLimit = b.per_txn_limit;
  if (b.is_active !== undefined) data.isActive = b.is_active;

  const card = await prisma.fuelCard.update({ where: { id }, data });
  const action = b.vehicle_id !== undefined || b.driver_id !== undefined ? 'fuel_card.assigned' : 'fuel_card.updated';
  await auditLog(req, action, 'fuel_cards', id, { ...before, cardNumber: '[encrypted]' }, { ...card, cardNumber: '[encrypted]' });
  return ok(res, presentCard(card, req));
}

/** POST /fuel-cards/:id/sync-balance */
async function syncBalance(req, res) {
  const id = Number(req.params.id);
  const card = await prisma.fuelCard.findFirst({ where: { id, deletedAt: null } });
  if (!card) throw AppError.notFound('Fuel card not found');
  let balance = null;
  try {
    balance = await issuerClient(card.cardType).getBalance(card.apiCardId);
  } catch (_e) {
    balance = null;
  }
  const updated = await prisma.fuelCard.update({
    where: { id },
    data: { balanceSyncedAt: new Date(), ...(balance != null ? { balance } : {}) },
  });
  await auditLog(req, 'fuel_card.synced', 'fuel_cards', id, null, { balance: updated.balance });
  return ok(res, { id, balance: updated.balance, fetched: balance != null });
}

/** POST /fuel-cards/:id/block */
async function block(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.fuelCard.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Fuel card not found');
  try {
    await issuerClient(before.cardType).block(before.apiCardId, req.body.reason);
  } catch (_e) {
    /* issuer call best-effort */
  }
  const card = await prisma.fuelCard.update({
    where: { id },
    data: { isBlocked: true, isActive: false, blockReason: req.body.reason },
  });
  await auditLog(req, 'fuel_card.blocked', 'fuel_cards', id, { isBlocked: before.isBlocked }, { isBlocked: true, reason: req.body.reason });
  return ok(res, presentCard(card, req));
}

/** POST /fuel-cards/:id/unblock */
async function unblock(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.fuelCard.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Fuel card not found');
  try {
    await issuerClient(before.cardType).unblock(before.apiCardId);
  } catch (_e) {
    /* best-effort */
  }
  const card = await prisma.fuelCard.update({
    where: { id },
    data: { isBlocked: false, isActive: true, blockReason: null },
  });
  await auditLog(req, 'fuel_card.unblocked', 'fuel_cards', id, { isBlocked: before.isBlocked }, { isBlocked: false });
  return ok(res, presentCard(card, req));
}

/** GET /fuel-transactions */
async function listTransactions(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: TXN_SORTABLE, dateField: 'transactionAt', includable: ['trip', 'vehicle'] });
  const where = { ...q.where };
  const filters = { ...q.filtersApplied };
  if (raw.fuel_card_id) {
    where.fuelCardId = Number(raw.fuel_card_id);
    filters.fuel_card_id = Number(raw.fuel_card_id);
  }
  if (raw.vehicle_id) {
    where.vehicleId = Number(raw.vehicle_id);
    filters.vehicle_id = Number(raw.vehicle_id);
  }
  if (raw.driver_id) {
    // driver via card relation
    where.fuelCard = { driverId: Number(raw.driver_id) };
    filters.driver_id = Number(raw.driver_id);
  }
  if (raw.trip_id) {
    where.tripId = Number(raw.trip_id);
    filters.trip_id = Number(raw.trip_id);
  }
  if (raw.product_type) {
    const arr = Array.isArray(raw.product_type) ? raw.product_type : String(raw.product_type).split(',');
    where.productType = { in: arr };
    filters.product_type = arr;
  }
  if (raw.station_city) {
    where.fuelStationCity = { contains: String(raw.station_city) };
    filters.station_city = raw.station_city;
  }
  const amount = {};
  if (raw.min_amount) amount.gte = Number(raw.min_amount);
  if (raw.max_amount) amount.lte = Number(raw.max_amount);
  if (Object.keys(amount).length) where.amount = amount;

  const [total, items] = await Promise.all([
    prisma.fuelTransaction.count({ where }),
    prisma.fuelTransaction.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** POST /fuel-transactions/sync */
async function syncTransactions(req, res) {
  const result = await sync.syncFuelTransactions(req.body || {});
  await auditLog(req, 'fuel_card.synced', 'fuel_transactions', null, null, result);
  return ok(res, result);
}

/** POST /fuel-transactions/match-trips */
async function matchTrips(req, res) {
  const result = await sync.rematchTrips();
  await auditLog(req, 'fuel_card.rematched', 'fuel_transactions', null, null, result);
  return ok(res, result);
}

/** GET /fuel-transactions/export -> CSV */
async function exportTransactions(req, res) {
  const raw = req.validatedQuery || req.query;
  const where = {};
  if (raw.vehicle_id) where.vehicleId = Number(raw.vehicle_id);
  if (raw.driver_id) where.fuelCard = { driverId: Number(raw.driver_id) };
  const dateFilter = {};
  if (raw.from_date) dateFilter.gte = new Date(raw.from_date);
  if (raw.to_date) dateFilter.lte = new Date(raw.to_date);
  if (Object.keys(dateFilter).length) where.transactionAt = dateFilter;

  const rows = await prisma.fuelTransaction.findMany({ where, orderBy: { transactionAt: 'desc' }, take: 10000 });
  const header = ['transaction_id', 'station', 'city', 'product', 'litres', 'rate', 'amount', 'transaction_at', 'vehicle_id', 'trip_id'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.transactionId, csv(r.fuelStationName), csv(r.fuelStationCity), r.productType || '', r.quantityLtr || '', r.ratePerLtr || '', r.amount, r.transactionAt.toISOString(), r.vehicleId || '', r.tripId || ''].join(',')
    );
  }
  await auditLog(req, 'fuel_card.exported', 'fuel_transactions', null, null, { count: rows.length });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fuel_transactions.csv"');
  return res.send(lines.join('\n'));
}

function csv(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

module.exports = {
  schemas: { createSchema, patchSchema, blockSchema, syncSchema },
  list,
  getOne,
  create,
  patch,
  syncBalance,
  block,
  unblock,
  listTransactions,
  syncTransactions,
  matchTrips,
  exportTransactions,
};
