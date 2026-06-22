'use strict';

const axios = require('axios');
const dayjs = require('dayjs');
const env = require('../../config/env');

/**
 * HPCL FleetCard API client (TMS Architecture §7.1).
 * Stub-guarded when HPCL_FLEET_API_KEY is absent.
 */

function authHeaders() {
  return {
    'X-API-Key': env.HPCL_FLEET_API_KEY,
    'X-Client-Id': env.HPCL_FLEET_CLIENT_ID,
    'Content-Type': 'application/json',
  };
}

async function getTransactions(apiCardId, since) {
  if (!env.flags.hpcl || !env.HPCL_FLEET_BASE_URL || !apiCardId) return [];
  const resp = await axios.get(`${env.HPCL_FLEET_BASE_URL}/transactions`, {
    headers: authHeaders(),
    params: { cardId: apiCardId, from: since ? dayjs(since).toISOString() : undefined },
    timeout: 15000,
  });
  return ((resp.data && resp.data.transactions) || []).map(normalize);
}

async function getBalance(apiCardId) {
  if (!env.flags.hpcl || !env.HPCL_FLEET_BASE_URL || !apiCardId) return null;
  const resp = await axios.get(`${env.HPCL_FLEET_BASE_URL}/balance`, {
    headers: authHeaders(),
    params: { cardId: apiCardId },
    timeout: 15000,
  });
  return resp.data && typeof resp.data.balance === 'number' ? resp.data.balance : null;
}

async function block(apiCardId, reason) {
  if (!env.flags.hpcl || !env.HPCL_FLEET_BASE_URL || !apiCardId) return { ok: true, stub: true };
  await axios.post(
    `${env.HPCL_FLEET_BASE_URL}/cards/${apiCardId}/block`,
    { reason },
    { headers: authHeaders(), timeout: 15000 }
  );
  return { ok: true, stub: false };
}

async function unblock(apiCardId) {
  if (!env.flags.hpcl || !env.HPCL_FLEET_BASE_URL || !apiCardId) return { ok: true, stub: true };
  await axios.post(
    `${env.HPCL_FLEET_BASE_URL}/cards/${apiCardId}/unblock`,
    {},
    { headers: authHeaders(), timeout: 15000 }
  );
  return { ok: true, stub: false };
}

function normalize(r) {
  return {
    id: r.txnId || r.transactionId || r.id,
    stationName: r.stationName || r.outletName,
    stationCity: r.city,
    productType: r.product || r.productType,
    quantityLtr: r.quantity != null ? Number(r.quantity) : null,
    ratePerLtr: r.rate != null ? Number(r.rate) : null,
    amount: Number(r.amount || 0),
    odometerKm: r.odometer != null ? Number(r.odometer) : null,
    transactionAt: r.txnTime || r.transactionAt,
    raw: r,
  };
}

module.exports = { getTransactions, getBalance, block, unblock };
