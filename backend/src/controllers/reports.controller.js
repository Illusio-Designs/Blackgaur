const dayjs = require('dayjs');

function dateRange(raw, field = 'createdAt') {
  const where = {};
  const f = {};
  if (raw.from_date) f.gte = new Date(raw.from_date);
  if (raw.to_date) f.lte = new Date(raw.to_date);
  if (Object.keys(f).length) where[field] = f;
  return where;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * GET /reports/dashboard — landing-page KPIs, a 6-month revenue/cost series,
 * the trip-status distribution and per-vehicle toll/fuel spend. Shape matches
 * the admin overview UI (keys are snake-cased by the frontend API helper).
 */
async function dashboard(req, res) {
  const now = dayjs();
  const monthStart = now.startOf('month').toDate();
  const seriesStart = now.startOf('month').subtract(5, 'month').toDate();

  const [
    activeTrips,
    deliveredThisMonth,
    pendingExpenses,
    revenueAgg,
    fastagAgg,
    fuelAgg,
    vehiclesTotal,
    byStatus,
    invoicesForSeries,
    expensesForSeries,
    tollByVehicleRaw,
    fuelByVehicleRaw,
  ] = await Promise.all([
    prisma.trip.count({ where: { deletedAt: null, status: { in: ['loading', 'in_transit'] } } }),
    prisma.trip.count({ where: { deletedAt: null, status: 'delivered', actualArrival: { gte: monthStart } } }),
    prisma.tripExpense.count({ where: { status: 'pending' } }),
    prisma.invoice.aggregate({ where: { deletedAt: null, createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
    prisma.fastagTransaction.aggregate({ where: { transactionAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.fuelTransaction.aggregate({ where: { transactionAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.trip.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
    prisma.invoice.findMany({ where: { deletedAt: null, createdAt: { gte: seriesStart } }, select: { createdAt: true, totalAmount: true } }),
    prisma.tripExpense.findMany({ where: { expenseDate: { gte: seriesStart } }, select: { expenseDate: true, amount: true } }),
    prisma.fastagTransaction.groupBy({ by: ['vehicleId'], where: { transactionAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.fuelTransaction.groupBy({ by: ['vehicleId'], where: { transactionAt: { gte: monthStart } }, _sum: { amount: true, quantityLtr: true } }),
  ]);

  // 6-month revenue (invoices) vs cost (expenses) series.
  const buckets = [];
  for (let i = 5; i >= 0; i -= 1) {
    const m = now.startOf('month').subtract(i, 'month');
    buckets.push({ key: m.format('YYYY-MM'), month: MONTH_LABELS[m.month()], revenue: 0, cost: 0 });
  }
  const bucketOf = (d) => buckets.find((b) => b.key === dayjs(d).format('YYYY-MM'));
  invoicesForSeries.forEach((inv) => { const b = bucketOf(inv.createdAt); if (b) b.revenue += Number(inv.totalAmount || 0); });
  expensesForSeries.forEach((e) => { if (!e.expenseDate) return; const b = bucketOf(e.expenseDate); if (b) b.cost += Number(e.amount || 0); });
  const revenueSeries = buckets.map(({ month, revenue, cost }) => ({ month, revenue, cost }));

  const tripStatus = byStatus.map((s) => ({ name: s.status, value: s._count }));

  // Resolve vehicle registrations for the per-vehicle spend charts.
  const vehicleIds = [...new Set([...tollByVehicleRaw, ...fuelByVehicleRaw].map((r) => r.vehicleId).filter(Boolean))];
  const vehicles = vehicleIds.length
    ? await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { id: true, registrationNo: true } })
    : [];
  const regOf = (id) => vehicles.find((v) => v.id === id)?.registrationNo || '—';
  const tollByVehicle = tollByVehicleRaw
    .filter((r) => r.vehicleId)
    .map((r) => ({ vehicle: regOf(r.vehicleId), toll: Number(r._sum.amount || 0) }));
  const fuelByVehicle = fuelByVehicleRaw
    .filter((r) => r.vehicleId)
    .map((r) => ({ vehicle: regOf(r.vehicleId), spend: Number(r._sum.amount || 0), litres: Number(r._sum.quantityLtr || 0) }));

  const fleetUtilisation = vehiclesTotal > 0 ? Math.min(100, Math.round((activeTrips / vehiclesTotal) * 100)) : 0;

  return ok(res, {
    activeTrips,
    deliveredThisMonth,
    pendingExpenses,
    revenueThisMonth: Number(revenueAgg._sum.totalAmount || 0),
    fastagSpend: Number(fastagAgg._sum.amount || 0),
    fuelSpend: Number(fuelAgg._sum.amount || 0),
    fleetUtilisation,
    revenueSeries,
    tripStatus,
    tollByVehicle,
    fuelByVehicle,
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
