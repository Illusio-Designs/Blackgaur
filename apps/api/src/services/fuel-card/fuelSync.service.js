'use strict';

const dayjs = require('dayjs');
const prisma = require('../../lib/prisma');
const hpcl = require('./hpcl.service');
const iocl = require('./iocl.service');
const { matchTripByVehicleAndTime } = require('../fastag/fastagSync.service');

/** Map a card_type enum to its issuer client. */
function clientForCard(card) {
  switch (card.cardType) {
    case 'iocl_xtrarewards':
      return iocl;
    case 'hpcl_fleetcard':
    default:
      return hpcl; // HPCL acts as default; bpcl/shell/custom fall back to no-op stub via hpcl guards
  }
}

/**
 * Sync fuel transactions for all active cards (TMS Architecture §7.3).
 * - upserts fuel_transactions by transaction_id
 * - matches to trips
 * - auto-creates fuel trip_expenses (is_fuelcard_synced, auto_approved)
 * - updates trip.fuel_consumed_ltr running total
 *
 * @param {{ vehicleId?: number, from_date?: string }} [opts]
 */
async function syncFuelTransactions(opts = {}) {
  const where = { isActive: true, isBlocked: false, deletedAt: null };
  if (opts.vehicleId) where.vehicleId = Number(opts.vehicleId);

  const cards = await prisma.fuelCard.findMany({ where });
  const summary = { cards: cards.length, fetched: 0, inserted: 0, expenses: 0 };

  for (const card of cards) {
    const client = clientForCard(card);
    const since = opts.from_date ? dayjs(opts.from_date).toDate() : card.balanceSyncedAt;

    let txns = [];
    try {
      txns = await client.getTransactions(card.apiCardId, since);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[fuelSync] card ${card.id} fetch failed:`, e.message);
      continue;
    }
    summary.fetched += txns.length;

    for (const txn of txns) {
      if (!txn || !txn.id) continue;
      const vehicleId = card.vehicleId || null;
      const trip = vehicleId ? await matchTripByVehicleAndTime(vehicleId, txn.transactionAt) : null;

      const existing = await prisma.fuelTransaction.findUnique({
        where: { transactionId: String(txn.id) },
      });

      const data = {
        fuelCardId: card.id,
        vehicleId,
        tripId: trip ? trip.id : null,
        transactionId: String(txn.id),
        fuelStationName: txn.stationName || null,
        fuelStationCity: txn.stationCity || null,
        productType: txn.productType || null,
        quantityLtr: txn.quantityLtr != null ? txn.quantityLtr : null,
        ratePerLtr: txn.ratePerLtr != null ? txn.ratePerLtr : null,
        amount: txn.amount || 0,
        odometerKm: txn.odometerKm != null ? txn.odometerKm : null,
        transactionAt: dayjs(txn.transactionAt).toDate(),
        rawResponse: txn.raw || undefined,
        syncedAt: new Date(),
      };

      await prisma.fuelTransaction.upsert({
        where: { transactionId: String(txn.id) },
        create: data,
        update: { tripId: data.tripId, syncedAt: data.syncedAt },
      });
      if (!existing) summary.inserted += 1;

      if (!existing && trip) {
        await prisma.tripExpense.create({
          data: {
            tripId: trip.id,
            driverId: trip.driverId || null,
            expenseType: 'fuel',
            amount: txn.amount || 0,
            description: `Fuel @ ${txn.stationName || 'station'}${txn.quantityLtr ? ` (${txn.quantityLtr} L)` : ''}`,
            expenseDate: dayjs(txn.transactionAt).toDate(),
            isFuelcardSynced: true,
            status: 'auto_approved',
            approvedAt: new Date(),
          },
        });
        summary.expenses += 1;

        // Update trip fuel running total from all matched fuel transactions.
        const agg = await prisma.fuelTransaction.aggregate({
          where: { tripId: trip.id },
          _sum: { quantityLtr: true },
        });
        await prisma.trip.update({
          where: { id: trip.id },
          data: { fuelConsumedLtr: agg._sum.quantityLtr || 0 },
        });
      }
    }

    // Refresh balance.
    let balance = null;
    try {
      balance = await client.getBalance(card.apiCardId);
    } catch (_e) {
      balance = null;
    }
    await prisma.fuelCard.update({
      where: { id: card.id },
      data: { balanceSyncedAt: new Date(), ...(balance != null ? { balance } : {}) },
    });
  }

  return summary;
}

/** Re-run trip matching over unmatched fuel transactions. */
async function rematchTrips() {
  const orphans = await prisma.fuelTransaction.findMany({ where: { tripId: null }, take: 1000 });
  let matched = 0;
  for (const txn of orphans) {
    if (!txn.vehicleId) continue;
    const trip = await matchTripByVehicleAndTime(txn.vehicleId, txn.transactionAt);
    if (trip) {
      await prisma.fuelTransaction.update({ where: { id: txn.id }, data: { tripId: trip.id } });
      matched += 1;
    }
  }
  return { matched };
}

module.exports = { syncFuelTransactions, rematchTrips };
