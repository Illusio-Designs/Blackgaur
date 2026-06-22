'use strict';

const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');

function dateRange(raw, field = 'createdAt') {
  const where = {};
  const f = {};
  if (raw.from_date) f.gte = new Date(raw.from_date);
  if (raw.to_date) f.lte = new Date(raw.to_date);
  if (Object.keys(f).length) where[field] = f;
  return where;
}

/** GET /reports/dashboard */
async function dashboard(req, res) {
  const raw = req.validatedQuery || req.query;
  const tripWhere = { deletedAt: null, ...dateRange(raw) };
  if (raw.branch_id) tripWhere.branchId = Number(raw.branch_id);

  const [tripCount, byStatus, freight, expenseSum, invoiceAgg, openInvoices] = await Promise.all([
    prisma.trip.count({ where: tripWhere }),
    prisma.trip.groupBy({ by: ['status'], where: tripWhere, _count: true }),
    prisma.trip.aggregate({ where: tripWhere, _sum: { freightCharges: true } }),
    prisma.tripExpense.aggregate({ where: dateRange(raw, 'expenseDate'), _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { deletedAt: null, ...dateRange(raw) }, _sum: { totalAmount: true, paidAmount: true } }),
    prisma.invoice.count({ where: { deletedAt: null, status: { notIn: ['paid', 'cancelled'] } } }),
  ]);

  return ok(res, {
    trips: { total: tripCount, byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })) },
    revenue: {
      freight: freight._sum.freightCharges || 0,
      invoiced: invoiceAgg._sum.totalAmount || 0,
      collected: invoiceAgg._sum.paidAmount || 0,
      outstandingInvoices: openInvoices,
    },
    expenses: { total: expenseSum._sum.amount || 0 },
  });
}

/** GET /reports/trips */
async function trips(req, res) {
  const raw = req.validatedQuery || req.query;
  const groupBy = ['status', 'driver', 'vehicle', 'route'].includes(raw.group_by) ? raw.group_by : 'status';
  const where = { deletedAt: null, ...dateRange(raw) };

  let groups;
  if (groupBy === 'status') {
    const g = await prisma.trip.groupBy({ by: ['status'], where, _count: true, _sum: { freightCharges: true } });
    groups = g.map((x) => ({ key: x.status, count: x._count, freight: x._sum.freightCharges || 0 }));
  } else if (groupBy === 'driver') {
    const g = await prisma.trip.groupBy({ by: ['driverId'], where, _count: true, _sum: { freightCharges: true } });
    groups = g.map((x) => ({ key: x.driverId, count: x._count, freight: x._sum.freightCharges || 0 }));
  } else if (groupBy === 'vehicle') {
    const g = await prisma.trip.groupBy({ by: ['vehicleId'], where, _count: true, _sum: { freightCharges: true } });
    groups = g.map((x) => ({ key: x.vehicleId, count: x._count, freight: x._sum.freightCharges || 0 }));
  } else {
    const rows = await prisma.trip.findMany({ where, select: { originCity: true, destinationCity: true, freightCharges: true } });
    const map = {};
    for (const r of rows) {
      const key = `${r.originCity} -> ${r.destinationCity}`;
      map[key] = map[key] || { key, count: 0, freight: 0 };
      map[key].count += 1;
      map[key].freight += Number(r.freightCharges || 0);
    }
    groups = Object.values(map);
  }
  return ok(res, { group_by: groupBy, groups });
}

/** GET /reports/finance */
async function finance(req, res) {
  const raw = req.validatedQuery || req.query;
  const groupBy = ['month', 'client', 'type'].includes(raw.group_by) ? raw.group_by : 'month';
  const where = { deletedAt: null, ...dateRange(raw) };

  let groups;
  if (groupBy === 'client') {
    const g = await prisma.invoice.groupBy({ by: ['clientId'], where, _count: true, _sum: { totalAmount: true, paidAmount: true } });
    groups = g.map((x) => ({ key: x.clientId, count: x._count, invoiced: x._sum.totalAmount || 0, collected: x._sum.paidAmount || 0 }));
  } else if (groupBy === 'type') {
    const g = await prisma.invoice.groupBy({ by: ['invoiceType'], where, _count: true, _sum: { totalAmount: true } });
    groups = g.map((x) => ({ key: x.invoiceType, count: x._count, invoiced: x._sum.totalAmount || 0 }));
  } else {
    const rows = await prisma.invoice.findMany({ where, select: { createdAt: true, totalAmount: true, paidAmount: true } });
    const map = {};
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 7);
      map[key] = map[key] || { key, count: 0, invoiced: 0, collected: 0 };
      map[key].count += 1;
      map[key].invoiced += Number(r.totalAmount || 0);
      map[key].collected += Number(r.paidAmount || 0);
    }
    groups = Object.values(map);
  }
  return ok(res, { group_by: groupBy, groups });
}

/** GET /reports/fastag */
async function fastag(req, res) {
  const raw = req.validatedQuery || req.query;
  const groupBy = ['vehicle', 'month', 'highway'].includes(raw.group_by) ? raw.group_by : 'vehicle';
  const where = { ...dateRange(raw, 'transactionAt') };
  if (raw.vehicle_id) where.vehicleId = Number(raw.vehicle_id);

  let groups;
  if (groupBy === 'vehicle') {
    const g = await prisma.fastagTransaction.groupBy({ by: ['vehicleId'], where, _count: true, _sum: { amount: true } });
    groups = g.map((x) => ({ key: x.vehicleId, count: x._count, total: x._sum.amount || 0 }));
  } else if (groupBy === 'highway') {
    const g = await prisma.fastagTransaction.groupBy({ by: ['highway'], where, _count: true, _sum: { amount: true } });
    groups = g.map((x) => ({ key: x.highway, count: x._count, total: x._sum.amount || 0 }));
  } else {
    const rows = await prisma.fastagTransaction.findMany({ where, select: { transactionAt: true, amount: true } });
    const map = {};
    for (const r of rows) {
      const key = r.transactionAt.toISOString().slice(0, 7);
      map[key] = map[key] || { key, count: 0, total: 0 };
      map[key].count += 1;
      map[key].total += Number(r.amount || 0);
    }
    groups = Object.values(map);
  }
  return ok(res, { group_by: groupBy, groups });
}

/** GET /reports/fuel */
async function fuel(req, res) {
  const raw = req.validatedQuery || req.query;
  const groupBy = ['vehicle', 'station', 'month'].includes(raw.group_by) ? raw.group_by : 'vehicle';
  const where = { ...dateRange(raw, 'transactionAt') };
  if (raw.vehicle_id) where.vehicleId = Number(raw.vehicle_id);

  let groups;
  if (groupBy === 'vehicle') {
    const g = await prisma.fuelTransaction.groupBy({ by: ['vehicleId'], where, _count: true, _sum: { amount: true, quantityLtr: true } });
    groups = g.map((x) => ({ key: x.vehicleId, count: x._count, amount: x._sum.amount || 0, litres: x._sum.quantityLtr || 0 }));
  } else if (groupBy === 'station') {
    const g = await prisma.fuelTransaction.groupBy({ by: ['fuelStationName'], where, _count: true, _sum: { amount: true, quantityLtr: true } });
    groups = g.map((x) => ({ key: x.fuelStationName, count: x._count, amount: x._sum.amount || 0, litres: x._sum.quantityLtr || 0 }));
  } else {
    const rows = await prisma.fuelTransaction.findMany({ where, select: { transactionAt: true, amount: true, quantityLtr: true } });
    const map = {};
    for (const r of rows) {
      const key = r.transactionAt.toISOString().slice(0, 7);
      map[key] = map[key] || { key, count: 0, amount: 0, litres: 0 };
      map[key].count += 1;
      map[key].amount += Number(r.amount || 0);
      map[key].litres += Number(r.quantityLtr || 0);
    }
    groups = Object.values(map);
  }
  return ok(res, { group_by: groupBy, groups });
}

/** GET /reports/clients */
async function clients(req, res) {
  const raw = req.validatedQuery || req.query;
  const where = { deletedAt: null, ...dateRange(raw) };
  if (raw.client_id) where.clientId = Number(raw.client_id);

  const g = await prisma.invoice.groupBy({
    by: ['clientId'],
    where,
    _count: true,
    _sum: { totalAmount: true, paidAmount: true },
  });
  const groups = g.map((x) => ({
    clientId: x.clientId,
    invoices: x._count,
    invoiced: x._sum.totalAmount || 0,
    collected: x._sum.paidAmount || 0,
    outstanding: Number(x._sum.totalAmount || 0) - Number(x._sum.paidAmount || 0),
  }));
  return ok(res, { groups });
}

module.exports = { dashboard, trips, finance, fastag, fuel, clients };
