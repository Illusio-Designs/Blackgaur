'use strict';

const axios = require('axios');
const dayjs = require('dayjs');
const env = require('../../config/env');

/**
 * IOCL XtraRewards Fleet API client (TMS Architecture §7.1).
 * Stub-guarded when IOCL_FLEET_API_KEY is absent.
 */

function authHeaders() {
  return { Authorization: `Bearer ${env.IOCL_FLEET_API_KEY}`, 'Content-Type': 'application/json' };
}

async function getTransactions(apiCardId, since) {
  if (!env.flags.iocl || !env.IOCL_FLEET_BASE_URL || !apiCardId) return [];
  const resp = await axios.get(`${env.IOCL_FLEET_BASE_URL}/fleet/transactions`, {
    headers: authHeaders(),
    params: { card: apiCardId, since: since ? dayjs(since).toISOString() : undefined },
    timeout: 15000,
  });
  return ((resp.data && resp.data.data) || []).map((r) => ({
    id: r.transactionId,
    stationName: r.retailOutlet,
    stationCity: r.city,
    productType: r.product,
    quantityLtr: r.litres != null ? Number(r.litres) : null,
    ratePerLtr: r.rate != null ? Number(r.rate) : null,
    amount: Number(r.amount || 0),
    odometerKm: r.odometer != null ? Number(r.odometer) : null,
    transactionAt: r.dateTime,
    raw: r,
  }));
}

async function getBalance(apiCardId) {
  if (!env.flags.iocl || !env.IOCL_FLEET_BASE_URL || !apiCardId) return null;
  const resp = await axios.get(`${env.IOCL_FLEET_BASE_URL}/fleet/balance`, {
    headers: authHeaders(),
    params: { card: apiCardId },
    timeout: 15000,
  });
  return resp.data && typeof resp.data.balance === 'number' ? resp.data.balance : null;
}

async function block(apiCardId, reason) {
  if (!env.flags.iocl || !env.IOCL_FLEET_BASE_URL || !apiCardId) return { ok: true, stub: true };
  await axios.post(
    `${env.IOCL_FLEET_BASE_URL}/fleet/cards/${apiCardId}/block`,
    { reason },
    { headers: authHeaders(), timeout: 15000 }
  );
  return { ok: true, stub: false };
}

async function unblock(apiCardId) {
  if (!env.flags.iocl || !env.IOCL_FLEET_BASE_URL || !apiCardId) return { ok: true, stub: true };
  await axios.post(
    `${env.IOCL_FLEET_BASE_URL}/fleet/cards/${apiCardId}/unblock`,
    {},
    { headers: authHeaders(), timeout: 15000 }
  );
  return { ok: true, stub: false };
}

module.exports = { getTransactions, getBalance, block, unblock };
