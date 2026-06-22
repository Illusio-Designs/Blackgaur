'use strict';

const { z } = require('zod');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');
const { uploadFile } = require('../services/s3.service');

const SORTABLE = ['createdAt', 'plannedDeparture', 'actualDeparture', 'status', 'lrNumber', 'freightCharges'];
const SEARCHABLE = ['lrNumber', 'originCity', 'destinationCity', 'cargoType', 'ewayBillNo'];
const INCLUDABLE = ['client', 'driver', 'vehicle', 'branch', 'tripManager', 'expenses', 'fastagTransactions', 'fuelTransactions', 'invoices'];

const createSchema = z.object({
  lr_number: z.string().max(30).optional(),
  vehicle_id: z.coerce.number().int().positive().optional().nullable(),
  driver_id: z.coerce.number().int().positive().optional().nullable(),
  client_id: z.coerce.number().int().positive().optional().nullable(),
  branch_id: z.coerce.number().int().positive().optional().nullable(),
  origin_city: z.string().min(1).max(100),
  origin_address: z.string().max(2000).optional(),
  destination_city: z.string().min(1).max(100),
  destination_address: z.string().max(2000).optional(),
  cargo_type: z.string().max(80).optional(),
  cargo_weight_kg: z.coerce.number().nonnegative().optional(),
  cargo_value: z.coerce.number().nonnegative().optional(),
  planned_departure: z.coerce.date().optional(),
  freight_charges: z.coerce.number().nonnegative().optional(),
  estimated_fastag_toll: z.coerce.number().nonnegative().optional(),
  eway_bill_no: z.string().max(20).optional(),
  eway_bill_expiry: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

const updateSchema = createSchema.partial();

const statusSchema = z.object({
  status: z.enum(['planned', 'loading', 'in_transit', 'delivered', 'cancelled']),
  timestamp: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

const podSchema = z.object({ notes: z.string().max(2000).optional() });

/** Generate a unique LR number GJ-YYYY-XXXX style. */
async function generateLrNumber() {
  const year = dayjs().year();
  for (let i = 0; i < 5; i += 1) {
    const candidate = `LR-${year}-${nanoid(6).toUpperCase()}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.trip.findUnique({ where: { lrNumber: candidate } });
    if (!exists) return candidate;
  }
  return `LR-${year}-${Date.now()}`;
}

/** Build include object scoped to driver visibility. */
function includeFromQuery(raw) {
  if (!raw.include) return undefined;
  const inc = {};
  String(raw.include)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => INCLUDABLE.includes(s))
    .forEach((rel) => {
      inc[rel] = true;
    });
  return Object.keys(inc).length ? inc : undefined;
}

/** GET /trips */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE, searchable: SEARCHABLE, includable: INCLUDABLE });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };

  // Scope: driver sees only own trips.
  if (req.permissionScope === 'own') {
    where.driverId = req.user.userId;
  }

  applyArray(where, filters, 'status', raw.status, 'status');
  applyEq(where, filters, 'driverId', raw.driver_id, 'driver_id');
  applyEq(where, filters, 'vehicleId', raw.vehicle_id, 'vehicle_id');
  applyEq(where, filters, 'clientId', raw.client_id, 'client_id');
  applyEq(where, filters, 'branchId', raw.branch_id, 'branch_id');
  if (raw.origin_city) {
    where.originCity = { contains: String(raw.origin_city) };
    filters.origin_city = raw.origin_city;
  }
  if (raw.destination_city) {
    where.destinationCity = { contains: String(raw.destination_city) };
    filters.destination_city = raw.destination_city;
  }

  const [total, items] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy: q.orderBy,
      skip: q.skip,
      take: q.take,
      include: q.include,
    }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /trips/:id */
async function getOne(req, res) {
  const raw = req.validatedQuery || req.query;
  const include = includeFromQuery(raw);
  const trip = await prisma.trip.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
    include,
  });
  if (!trip) throw AppError.notFound('Trip not found');
  if (req.permissionScope === 'own' && trip.driverId !== req.user.userId) {
    throw AppError.forbidden('You can only view your own trips');
  }
  return ok(res, trip);
}

/** POST /trips */
async function create(req, res) {
  const b = req.body;
  const lrNumber = b.lr_number || (await generateLrNumber());

  const trip = await prisma.trip.create({
    data: {
      lrNumber,
      vehicleId: b.vehicle_id || null,
      driverId: b.driver_id || null,
      clientId: b.client_id || null,
      branchId: b.branch_id || req.user.branchId || null,
      originCity: b.origin_city,
      originAddress: b.origin_address || null,
      destinationCity: b.destination_city,
      destinationAddress: b.destination_address || null,
      cargoType: b.cargo_type || null,
      cargoWeightKg: b.cargo_weight_kg ?? null,
      cargoValue: b.cargo_value ?? null,
      plannedDeparture: b.planned_departure || null,
      freightCharges: b.freight_charges ?? null,
      estimatedFastagToll: b.estimated_fastag_toll ?? null,
      ewayBillNo: b.eway_bill_no || null,
      ewayBillExpiry: b.eway_bill_expiry || null,
      notes: b.notes || null,
      tripManagerId: req.user.userId,
    },
  });
  await auditLog(req, 'trip.created', 'trips', trip.id, null, trip, `LR# ${trip.lrNumber}`);
  return ok(res, trip, { status: 201 });
}

/** PUT /trips/:id */
async function update(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.trip.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Trip not found');

  const b = req.body;
  const data = {};
  const map = {
    vehicle_id: 'vehicleId',
    driver_id: 'driverId',
    client_id: 'clientId',
    branch_id: 'branchId',
    origin_city: 'originCity',
    origin_address: 'originAddress',
    destination_city: 'destinationCity',
    destination_address: 'destinationAddress',
    cargo_type: 'cargoType',
    cargo_weight_kg: 'cargoWeightKg',
    cargo_value: 'cargoValue',
    planned_departure: 'plannedDeparture',
    freight_charges: 'freightCharges',
    estimated_fastag_toll: 'estimatedFastagToll',
    eway_bill_no: 'ewayBillNo',
    eway_bill_expiry: 'ewayBillExpiry',
    notes: 'notes',
  };
  for (const [k, field] of Object.entries(map)) {
    if (b[k] !== undefined) data[field] = b[k] === '' ? null : b[k];
  }

  const trip = await prisma.trip.update({ where: { id }, data });
  await auditLog(req, 'trip.updated', 'trips', id, before, trip, `LR# ${trip.lrNumber}`);
  return ok(res, trip);
}

/** PATCH /trips/:id/status */
async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.trip.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Trip not found');
  if (req.permissionScope === 'own' && before.driverId !== req.user.userId) {
    throw AppError.forbidden('You can only update your own trips');
  }

  const { status, timestamp, notes } = req.body;
  const ts = timestamp ? new Date(timestamp) : new Date();
  const data = { status };
  if (status === 'in_transit' && !before.actualDeparture) data.actualDeparture = ts;
  if (status === 'delivered' && !before.actualArrival) data.actualArrival = ts;
  if (notes) data.notes = notes;

  const trip = await prisma.trip.update({ where: { id }, data });
  await auditLog(
    req,
    'trip.status.changed',
    'trips',
    id,
    { status: before.status },
    { status: trip.status },
    `LR# ${trip.lrNumber}`
  );
  return ok(res, trip);
}

/** POST /trips/:id/pod (multipart) */
async function uploadPod(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.trip.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Trip not found');
  if (req.permissionScope === 'own' && before.driverId !== req.user.userId) {
    throw AppError.forbidden('You can only upload POD for your own trips');
  }
  if (!req.file) throw AppError.badRequest('POD file is required');

  const uploaded = await uploadFile({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    folder: 'pod',
  });

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      podUrl: uploaded.url,
      actualArrival: before.actualArrival || new Date(),
      status: before.status === 'cancelled' ? before.status : 'delivered',
      ...(req.body && req.body.notes ? { notes: req.body.notes } : {}),
    },
  });
  await auditLog(req, 'pod.uploaded', 'trips', id, null, { podUrl: uploaded.url }, `LR# ${trip.lrNumber}`);
  return ok(res, trip);
}

/** DELETE /trips/:id (soft delete) */
async function remove(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.trip.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Trip not found');
  await prisma.trip.update({ where: { id }, data: { deletedAt: new Date() } });
  await auditLog(req, 'trip.cancelled', 'trips', id, before, null, `LR# ${before.lrNumber}`);
  return ok(res, { id, deleted: true });
}

function applyEq(where, filters, field, value, filterKey) {
  if (value !== undefined && value !== '') {
    where[field] = Number(value);
    filters[filterKey] = Number(value);
  }
}
function applyArray(where, filters, field, value, filterKey) {
  if (value === undefined) return;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  const clean = arr.map((s) => String(s).trim()).filter(Boolean);
  if (clean.length) {
    where[field] = { in: clean };
    filters[filterKey] = clean;
  }
}

module.exports = {
  schemas: { createSchema, updateSchema, statusSchema, podSchema },
  list,
  getOne,
  create,
  update,
  updateStatus,
  uploadPod,
  remove,
};
