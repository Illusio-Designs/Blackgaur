'use strict';

const dayjs = require('dayjs');
const prisma = require('../../lib/prisma');
const ihmcl = require('./ihmcl.service');
const hdfc = require('./hdfc.service');

/**
 * Pick the issuer client for a wallet. IHMCL is the unified default;
 * HDFC used only when issuer is explicitly HDFC.
 */
function clientForWallet(wallet) {
  const issuer = String(wallet.tagIssuer || '').toUpperCase();
  if (issuer === 'HDFC') return hdfc;
  return ihmcl;
}

/**
 * Match a FASTag transaction to a trip by vehicle + time window (TMS Architecture §6.4).
 * A trip matches when the txn time falls within [actualDeparture||planned, actualArrival||now]
 * for the same vehicle. Returns the most recent matching trip or null.
 *
 * @param {number} vehicleId
 * @param {Date|string} transactionAt
 */
async function matchTripByVehicleAndTime(vehicleId, transactionAt) {
  if (!vehicleId) return null;
  const at = dayjs(transactionAt).toDate();
  const trips = await prisma.trip.findMany({
    where: {
      vehicleId,
      deletedAt: null,
      status: { in: ['planned', 'loading', 'in_transit', 'delivered'] },
    },
    orderBy: { plannedDeparture: 'desc' },
    take: 50,
  });
  for (const trip of trips) {
    const start = trip.actualDeparture || trip.plannedDeparture || trip.createdAt;
    const end = trip.actualArrival || new Date();
    if (start && at >= new Date(start) && at <= new Date(end)) return trip;
  }
  return null;
}

/**
 * Sync FASTag transactions for all active wallets (TMS Architecture §6.4).
 * - upserts fastag_transactions by transaction_id
 * - matches each to a trip
 * - auto-creates toll trip_expenses (is_fastag_synced, auto_approved)
 * - refreshes wallet balance
 *
 * @param {{ vehicleId?: number, from_date?: string }} [opts]
 * @returns {Promise<{ wallets: number, fetched: number, inserted: number, expenses: number }>}
 */
async function syncFastagTransactions(opts = {}) {
  const where = { isActive: true };
  if (opts.vehicleId) where.vehicleId = Number(opts.vehicleId);

  const wallets = await prisma.fastagWallet.findMany({ where });
  const summary = { wallets: wallets.length, fetched: 0, inserted: 0, expenses: 0 };

  for (const wallet of wallets) {
    const client = clientForWallet(wallet);
    const since = opts.from_date ? dayjs(opts.from_date).toDate() : wallet.balanceSyncedAt;

    let txns = [];
    try {
      txns = await client.getTransactions(wallet.apiAccountId || wallet.tagId, since);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[fastagSync] wallet ${wallet.id} fetch failed:`, e.message);
      continue;
    }
    summary.fetched += txns.length;

    let latestBalance = null;

    for (const txn of txns) {
      if (!txn || !txn.id) continue;
      const trip = await matchTripByVehicleAndTime(wallet.vehicleId, txn.transactionAt);

      const existing = await prisma.fastagTransaction.findUnique({
        where: { transactionId: String(txn.id) },
      });

      const data = {
        fastagWalletId: wallet.id,
        vehicleId: wallet.vehicleId,
        tripId: trip ? trip.id : null,
        transactionId: String(txn.id),
        plazaName: txn.plazaName || null,
        plazaCode: txn.plazaCode || null,
        highway: txn.highway || null,
        amount: txn.amount || 0,
        balanceAfter: txn.balanceAfter != null ? txn.balanceAfter : null,
        transactionAt: dayjs(txn.transactionAt).toDate(),
        direction: ['entry', 'exit', 'single'].includes(txn.direction) ? txn.direction : 'single',
        vehicleClass: txn.vehicleClass || null,
        rawResponse: txn.raw || undefined,
        syncedAt: new Date(),
      };

      await prisma.fastagTransaction.upsert({
        where: { transactionId: String(txn.id) },
        create: data,
        update: { tripId: data.tripId, balanceAfter: data.balanceAfter, syncedAt: data.syncedAt },
      });
      if (!existing) summary.inserted += 1;
      if (txn.balanceAfter != null) latestBalance = txn.balanceAfter;

      // Auto-create toll expense (only for newly inserted, matched-to-trip txns).
      if (!existing && trip) {
        await prisma.tripExpense.create({
          data: {
            tripId: trip.id,
            driverId: trip.driverId || null,
            expenseType: 'toll',
            amount: txn.amount || 0,
            description: `FASTag toll @ ${txn.plazaName || 'plaza'}`,
            expenseDate: dayjs(txn.transactionAt).toDate(),
            isFastagSynced: true,
            status: 'auto_approved',
            approvedAt: new Date(),
          },
        });
        summary.expenses += 1;

        // Update trip running actual toll total.
        const agg = await prisma.fastagTransaction.aggregate({
          where: { tripId: trip.id },
          _sum: { amount: true },
        });
        await prisma.trip.update({
          where: { id: trip.id },
          data: { actualFastagToll: agg._sum.amount || 0 },
        });
      }
    }

    // Refresh wallet balance (API or last txn balance).
    let balance = null;
    try {
      balance = await client.getBalance(wallet.apiAccountId || wallet.tagId);
    } catch (_e) {
      balance = null;
    }
    if (balance == null) balance = latestBalance;
    if (balance != null) {
      await prisma.fastagWallet.update({
        where: { id: wallet.id },
        data: { balance, balanceSyncedAt: new Date() },
      });
    } else {
      await prisma.fastagWallet.update({
        where: { id: wallet.id },
        data: { balanceSyncedAt: new Date() },
      });
    }
  }

  return summary;
}

/**
 * Re-run trip matching over all currently unmatched transactions.
 * @returns {Promise<{ matched: number }>}
 */
async function rematchTrips() {
  const orphans = await prisma.fastagTransaction.findMany({ where: { tripId: null }, take: 1000 });
  let matched = 0;
  for (const txn of orphans) {
    const trip = await matchTripByVehicleAndTime(txn.vehicleId, txn.transactionAt);
    if (trip) {
      await prisma.fastagTransaction.update({ where: { id: txn.id }, data: { tripId: trip.id } });
      matched += 1;
    }
  }
  return { matched };
}

module.exports = { syncFastagTransactions, matchTripByVehicleAndTime, rematchTrips };
