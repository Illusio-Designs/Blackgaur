'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');

const SORTABLE = ['createdAt', 'name', 'mobile', 'lastLoginAt', 'isActive'];
const SEARCHABLE = ['name', 'mobile', 'email'];

const createSchema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().max(180).optional().nullable(),
  role_id: z.coerce.number().int().positive(),
  branch_id: z.coerce.number().int().positive().optional().nullable(),
  language_pref: z.enum(['en', 'hi', 'gu']).optional(),
});

const updateSchema = createSchema.partial().omit({ mobile: true });

const userSelect = {
  id: true,
  name: true,
  mobile: true,
  email: true,
  roleId: true,
  branchId: true,
  languagePref: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  role: { select: { id: true, name: true, label: true } },
  branch: { select: { id: true, name: true } },
};

/** GET /users */
async function list(req, res) {
  const q = parseListQuery(req.validatedQuery || req.query, {
    sortable: SORTABLE,
    searchable: SEARCHABLE,
  });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };
  const raw = req.validatedQuery || req.query;

  if (raw.role_id) {
    where.roleId = Number(raw.role_id);
    filters.role_id = Number(raw.role_id);
  }
  if (raw.branch_id) {
    where.branchId = Number(raw.branch_id);
    filters.branch_id = Number(raw.branch_id);
  }
  if (raw.is_active !== undefined) {
    where.isActive = raw.is_active === 'true' || raw.is_active === true;
    filters.is_active = where.isActive;
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, select: userSelect }),
  ]);

  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /users/:id */
async function getOne(req, res) {
  const user = await prisma.user.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
    select: userSelect,
  });
  if (!user) throw AppError.notFound('User not found');
  return ok(res, user);
}

/** POST /users */
async function create(req, res) {
  const b = req.body;
  const role = await prisma.role.findUnique({ where: { id: b.role_id } });
  if (!role) throw AppError.badRequest('Invalid role_id');

  const user = await prisma.user.create({
    data: {
      name: b.name,
      mobile: b.mobile,
      email: b.email || null,
      roleId: b.role_id,
      branchId: b.branch_id || null,
      languagePref: b.language_pref || 'en',
    },
    select: userSelect,
  });
  await auditLog(req, 'user.created', 'users', user.id, null, user, user.name);
  return ok(res, user, { status: 201 });
}

/** PUT /users/:id */
async function update(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('User not found');

  const b = req.body;
  const data = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.email !== undefined) data.email = b.email || null;
  if (b.role_id !== undefined) data.roleId = b.role_id;
  if (b.branch_id !== undefined) data.branchId = b.branch_id || null;
  if (b.language_pref !== undefined) data.languagePref = b.language_pref;

  const user = await prisma.user.update({ where: { id }, data, select: userSelect });
  await auditLog(req, 'user.updated', 'users', id, before, user, user.name);
  return ok(res, user);
}

/** PATCH /users/:id/toggle-active */
async function toggleActive(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('User not found');

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: !before.isActive },
    select: userSelect,
  });
  await auditLog(
    req,
    user.isActive ? 'user.activated' : 'user.deactivated',
    'users',
    id,
    before,
    user,
    user.name
  );
  return ok(res, user);
}

/** DELETE /users/:id (soft delete) */
async function remove(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('User not found');
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await auditLog(req, 'user.deleted', 'users', id, before, null, before.name);
  return ok(res, { id, deleted: true });
}

module.exports = {
  schemas: { createSchema, updateSchema },
  list,
  getOne,
  create,
  update,
  toggleActive,
  remove,
};
