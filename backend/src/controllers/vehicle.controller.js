'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');

const SORTABLE = ['createdAt', 'registrationNo', 'vehicleType', 'isAvailable'];
const SEARCHABLE = ['registrationNo', 'model', 'vehicleType', 'fastagTagId'];
const INCLUDABLE = ['driver', 'fastagWallet'];

const createSchema = z.object({
  registration_no: z.string().min(2).max(20),
  vehicle_type: z.string().min(1).max(60),
  capacity_tons: z.coerce.number().nonnegative().optional(),
  model: z.string().max(80).optional(),
  owner_type: z.enum(['own', 'attached', 'market']).optional(),
  driver_id: z.coerce.number().int().positive().optional().nullable(),
  rc_expiry: z.coerce.date().optional(),
  insurance_expiry: z.coerce.date().optional(),
  fitness_expiry: z.coerce.date().optional(),
  permit_expiry: z.coerce.date().optional(),
  fastag_tag_id: z.string().max(30).optional(),
  is_available: z.coerce.boolean().optional(),
  gps_device_id: z.string().max(80).optional(),
  gps_provider: z.string().max(40).optional(),
});

const updateSchema = createSchema.partial();

/** GET /vehicles */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE, searchable: SEARCHABLE, includable: INCLUDABLE });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };
  if (raw.is_available !== undefined) {
    where.isAvailable = raw.is_available === 'true' || raw.is_available === true;
    filters.is_available = where.isAvailable;
  }
  if (raw.owner_type) {
    where.ownerType = String(raw.owner_type);
    filters.owner_type = raw.owner_type;
  }
  if (raw.driver_id) {
    where.driverId = Number(raw.driver_id);
    filters.driver_id = Number(raw.driver_id);
  }

  const [total, items] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /vehicles/:id */
async function getOne(req, res) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
    include: { driver: { select: { id: true, name: true, mobile: true } }, fastagWallet: true },
  });
  if (!vehicle) throw AppError.notFound('Vehicle not found');
  return ok(res, vehicle);
}

const FIELD_MAP = {
  registration_no: 'registrationNo',
  vehicle_type: 'vehicleType',
  capacity_tons: 'capacityTons',
  model: 'model',
  owner_type: 'ownerType',
  driver_id: 'driverId',
  rc_expiry: 'rcExpiry',
  insurance_expiry: 'insuranceExpiry',
  fitness_expiry: 'fitnessExpiry',
  permit_expiry: 'permitExpiry',
  fastag_tag_id: 'fastagTagId',
  is_available: 'isAvailable',
  gps_device_id: 'gpsDeviceId',
  gps_provider: 'gpsProvider',
};

/** POST /vehicles */
async function create(req, res) {
  const b = req.body;
  const data = {};
  for (const [k, field] of Object.entries(FIELD_MAP)) {
    if (b[k] !== undefined) data[field] = b[k] === '' ? null : b[k];
  }
  const vehicle = await prisma.vehicle.create({ data });
  await auditLog(req, 'vehicle.created', 'vehicles', vehicle.id, null, vehicle, vehicle.registrationNo);
  return ok(res, vehicle, { status: 201 });
}

/** PUT /vehicles/:id */
async function update(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Vehicle not found');
  const b = req.body;
  const data = {};
  for (const [k, field] of Object.entries(FIELD_MAP)) {
    if (b[k] !== undefined) data[field] = b[k] === '' ? null : b[k];
  }
  const vehicle = await prisma.vehicle.update({ where: { id }, data });
  await auditLog(req, 'vehicle.updated', 'vehicles', id, before, vehicle, vehicle.registrationNo);
  return ok(res, vehicle);
}

/** DELETE /vehicles/:id (soft delete) */
async function remove(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Vehicle not found');
  await prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } });
  await auditLog(req, 'vehicle.deleted', 'vehicles', id, before, null, before.registrationNo);
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
