'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');
const ihmcl = require('../services/fastag/ihmcl.service');
const hdfc = require('../services/fastag/hdfc.service');
const sync = require('../services/fastag/fastagSync.service');

const WALLET_SORTABLE = ['createdAt', 'balance', 'balanceSyncedAt', 'tagId'];
const TXN_SORTABLE = ['transactionAt', 'amount', 'syncedAt'];

const createWalletSchema = z.object({
  vehicle_id: z.coerce.number().int().positive(),
  tag_id: z.string().min(1).max(30),
  tag_issuer: z.string().max(40).optional(),
  linked_mobile: z.string().max(15).optional(),
  api_account_id: z.string().max(80).optional(),
  low_balance_alert: z.coerce.number().nonnegative().optional(),
});

const patchWalletSchema = z.object({
  low_balance_alert: z.coerce.number().nonnegative().optional(),
  is_active: z.coerce.boolean().optional(),
});

const rechargeSchema = z.object({
  amount: z.coerce.number().positive(),
  payment_ref: z.string().max(80).optional(),
});

const syncSchema = z.object({
  from_date: z.coerce.date().optional(),
  to_date: z.coerce.date().optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
});

/** GET /fastag/wallets */
async function listWallets(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: WALLET_SORTABLE, includable: ['vehicle', 'transactions'] });
  const where = { ...q.where };
  const filters = { ...q.filtersApplied };
  if (raw.vehicle_id) {
    where.vehicleId = Number(raw.vehicle_id);
    filters.vehicle_id = Number(raw.vehicle_id);
  }
  if (raw.low_balance === 'true' || raw.low_balance === true) {
    // balance below threshold — fetch then filter (cross-column compare).
    filters.low_balance = true;
  }

  let [total, items] = await Promise.all([
    prisma.fastagWallet.count({ where }),
    prisma.fastagWallet.findMany({
      where,
      orderBy: q.orderBy,
      skip: q.skip,
      take: q.take,
      include: { vehicle: { select: { id: true, registrationNo: true } } },
    }),
  ]);

  if (filters.low_balance) {
    items = items.filter((w) => Number(w.balance) < Number(w.lowBalanceAlert));
  }

  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /fastag/wallets/:id */
async function getWallet(req, res) {
  const wallet = await prisma.fastagWallet.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      vehicle: { select: { id: true, registrationNo: true } },
      transactions: { take: 25, orderBy: { transactionAt: 'desc' } },
    },
  });
  if (!wallet) throw AppError.notFound('Wallet not found');
  return ok(res, wallet);
}

/** POST /fastag/wallets */
async function createWallet(req, res) {
  const b = req.body;
  const wallet = await prisma.fastagWallet.create({
    data: {
      vehicleId: b.vehicle_id,
      tagId: b.tag_id,
      tagIssuer: b.tag_issuer || null,
      linkedMobile: b.linked_mobile || null,
      apiAccountId: b.api_account_id || null,
      lowBalanceAlert: b.low_balance_alert ?? 200,
    },
  });
  await auditLog(req, 'fastag.wallet.added', 'fastag_wallets', wallet.id, null, wallet, wallet.tagId);
  return ok(res, wallet, { status: 201 });
}

/** PATCH /fastag/wallets/:id */
async function patchWallet(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.fastagWallet.findUnique({ where: { id } });
  if (!before) throw AppError.notFound('Wallet not found');
  const data = {};
  if (req.body.low_balance_alert !== undefined) data.lowBalanceAlert = req.body.low_balance_alert;
  if (req.body.is_active !== undefined) data.isActive = req.body.is_active;
  const wallet = await prisma.fastagWallet.update({ where: { id }, data });
  await auditLog(req, 'fastag.wallet.updated', 'fastag_wallets', id, before, wallet, wallet.tagId);
  return ok(res, wallet);
}

/** POST /fastag/wallets/:id/sync-balance */
async function syncBalance(req, res) {
  const id = Number(req.params.id);
  const wallet = await prisma.fastagWallet.findUnique({ where: { id } });
  if (!wallet) throw AppError.notFound('Wallet not found');
  const client = String(wallet.tagIssuer || '').toUpperCase() === 'HDFC' ? hdfc : ihmcl;
  let balance = null;
  try {
    balance = await client.getBalance(wallet.apiAccountId || wallet.tagId);
  } catch (_e) {
    balance = null;
  }
  const updated = await prisma.fastagWallet.update({
    where: { id },
    data: { balanceSyncedAt: new Date(), ...(balance != null ? { balance } : {}) },
  });
  await auditLog(req, 'fastag.synced', 'fastag_wallets', id, null, { balance: updated.balance }, wallet.tagId);
  return ok(res, { id, balance: updated.balance, balanceSyncedAt: updated.balanceSyncedAt, fetched: balance != null });
}

/** POST /fastag/wallets/:id/recharge — manual recharge log */
async function recharge(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.fastagWallet.findUnique({ where: { id } });
  if (!before) throw AppError.notFound('Wallet not found');
  const wallet = await prisma.fastagWallet.update({
    where: { id },
    data: { balance: Number(before.balance) + Number(req.body.amount), balanceSyncedAt: new Date() },
  });
  await auditLog(
    req,
    'fastag.recharged',
    'fastag_wallets',
    id,
    { balance: before.balance },
    { balance: wallet.balance, amount: req.body.amount, paymentRef: req.body.payment_ref || null },
    wallet.tagId
  );
  return ok(res, wallet);
}

/** GET /fastag/transactions */
async function listTransactions(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: TXN_SORTABLE, dateField: 'transactionAt', includable: ['trip', 'vehicle'] });
  const where = { ...q.where };
  const filters = { ...q.filtersApplied };
  if (raw.vehicle_id) {
    where.vehicleId = Number(raw.vehicle_id);
    filters.vehicle_id = Number(raw.vehicle_id);
  }
  if (raw.fastag_wallet_id) {
    where.fastagWalletId = Number(raw.fastag_wallet_id);
    filters.fastag_wallet_id = Number(raw.fastag_wallet_id);
  }
  if (raw.trip_id) {
    where.tripId = Number(raw.trip_id);
    filters.trip_id = Number(raw.trip_id);
  }
  if (raw.plaza_name) {
    where.plazaName = { contains: String(raw.plaza_name) };
    filters.plaza_name = raw.plaza_name;
  }
  if (raw.highway) {
    where.highway = { contains: String(raw.highway) };
    filters.highway = raw.highway;
  }
  const amount = {};
  if (raw.min_amount) amount.gte = Number(raw.min_amount);
  if (raw.max_amount) amount.lte = Number(raw.max_amount);
  if (Object.keys(amount).length) where.amount = amount;

  const [total, items] = await Promise.all([
    prisma.fastagTransaction.count({ where }),
    prisma.fastagTransaction.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** POST /fastag/transactions/sync */
async function syncTransactions(req, res) {
  const result = await sync.syncFastagTransactions(req.body || {});
  await auditLog(req, 'fastag.synced', 'fastag_transactions', null, null, result);
  return ok(res, result);
}

/** POST /fastag/transactions/match-trips */
async function matchTrips(req, res) {
  const result = await sync.rematchTrips();
  await auditLog(req, 'fastag.rematched', 'fastag_transactions', null, null, result);
  return ok(res, result);
}

/** GET /fastag/transactions/export -> CSV */
async function exportTransactions(req, res) {
  const raw = req.validatedQuery || req.query;
  const where = {};
  if (raw.vehicle_id) where.vehicleId = Number(raw.vehicle_id);
  const dateFilter = {};
  if (raw.from_date) dateFilter.gte = new Date(raw.from_date);
  if (raw.to_date) dateFilter.lte = new Date(raw.to_date);
  if (Object.keys(dateFilter).length) where.transactionAt = dateFilter;

  const rows = await prisma.fastagTransaction.findMany({ where, orderBy: { transactionAt: 'desc' }, take: 10000 });
  const header = ['transaction_id', 'plaza_name', 'highway', 'amount', 'transaction_at', 'vehicle_id', 'trip_id'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.transactionId, csv(r.plazaName), csv(r.highway), r.amount, r.transactionAt.toISOString(), r.vehicleId || '', r.tripId || ''].join(',')
    );
  }
  await auditLog(req, 'fastag.exported', 'fastag_transactions', null, null, { count: rows.length });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fastag_transactions.csv"');
  return res.send(lines.join('\n'));
}

function csv(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

module.exports = {
  schemas: { createWalletSchema, patchWalletSchema, rechargeSchema, syncSchema },
  listWallets,
  getWallet,
  createWallet,
  patchWallet,
  syncBalance,
  recharge,
  listTransactions,
  syncTransactions,
  matchTrips,
  exportTransactions,
};
