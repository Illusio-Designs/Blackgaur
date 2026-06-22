'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');

const SORTABLE = ['createdAt', 'companyName', 'creditDays'];
const SEARCHABLE = ['companyName', 'gstin', 'pan', 'contactName', 'contactMobile'];
const INCLUDABLE = ['accountManager'];

const createSchema = z.object({
  company_name: z.string().min(2).max(150),
  gstin: z.string().max(15).optional(),
  pan: z.string().max(10).optional(),
  state_code: z.string().length(2).optional(),
  contact_name: z.string().max(80).optional(),
  contact_mobile: z.string().max(15).optional(),
  billing_address: z.string().max(2000).optional(),
  credit_days: z.coerce.number().int().min(0).max(120).optional(),
  rcm_applicable: z.coerce.boolean().optional(),
  account_manager_id: z.coerce.number().int().positive().optional().nullable(),
});

const updateSchema = createSchema.partial();

/** GET /clients */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE, searchable: SEARCHABLE, includable: INCLUDABLE });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };
  if (raw.account_manager_id) {
    where.accountManagerId = Number(raw.account_manager_id);
    filters.account_manager_id = Number(raw.account_manager_id);
  }

  const [total, items] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /clients/:id */
async function getOne(req, res) {
  const client = await prisma.client.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
  });
  if (!client) throw AppError.notFound('Client not found');
  return ok(res, client);
}

/** POST /clients */
async function create(req, res) {
  const b = req.body;
  const client = await prisma.client.create({
    data: {
      companyName: b.company_name,
      gstin: b.gstin || null,
      pan: b.pan || null,
      stateCode: b.state_code || null,
      contactName: b.contact_name || null,
      contactMobile: b.contact_mobile || null,
      billingAddress: b.billing_address || null,
      creditDays: b.credit_days ?? 30,
      rcmApplicable: b.rcm_applicable ?? true,
      accountManagerId: b.account_manager_id || req.user.userId,
    },
  });
  await auditLog(req, 'client.created', 'clients', client.id, null, client, client.companyName);
  return ok(res, client, { status: 201 });
}

/** PUT /clients/:id */
async function update(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Client not found');

  const b = req.body;
  const map = {
    company_name: 'companyName',
    gstin: 'gstin',
    pan: 'pan',
    state_code: 'stateCode',
    contact_name: 'contactName',
    contact_mobile: 'contactMobile',
    billing_address: 'billingAddress',
    credit_days: 'creditDays',
    rcm_applicable: 'rcmApplicable',
    account_manager_id: 'accountManagerId',
  };
  const data = {};
  for (const [k, field] of Object.entries(map)) {
    if (b[k] !== undefined) data[field] = b[k] === '' ? null : b[k];
  }

  const client = await prisma.client.update({ where: { id }, data });
  await auditLog(req, 'client.updated', 'clients', id, before, client, client.companyName);
  return ok(res, client);
}

/** DELETE /clients/:id (soft delete) */
async function remove(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Client not found');
  await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
  await auditLog(req, 'client.deleted', 'clients', id, before, null, before.companyName);
  return ok(res, { id, deleted: true });
}

module.exports = {
  schemas: { createSchema, updateSchema },
  list,
  getOne,
  create,
  update,
  remove,
};
