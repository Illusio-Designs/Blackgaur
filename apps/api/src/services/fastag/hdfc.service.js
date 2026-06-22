'use strict';

const axios = require('axios');
const dayjs = require('dayjs');
const env = require('../../config/env');

/**
 * HDFC Bank FASTag API client (TMS Architecture §6.2).
 * Stub-guarded when HDFC_FASTAG_API_KEY is absent.
 */

function authHeaders() {
  return { Authorization: `Bearer ${env.HDFC_FASTAG_API_KEY}`, 'Content-Type': 'application/json' };
}

async function getTransactions(accountId, since) {
  if (!env.flags.hdfcFastag || !env.HDFC_FASTAG_BASE_URL || !accountId) return [];
  const resp = await axios.get(`${env.HDFC_FASTAG_BASE_URL}/fastag/transactions`, {
    headers: authHeaders(),
    params: { tagId: accountId, fromDate: since ? dayjs(since).toISOString() : undefined },
    timeout: 15000,
  });
  const rows = (resp.data && resp.data.data) || [];
  return rows.map((r) => ({
    id: r.transactionId,
    plazaName: r.plazaName,
    plazaCode: r.plazaCode,
    highway: r.highwayName,
    amount: Number(r.amount || 0),
    balanceAfter: r.balance != null ? Number(r.balance) : null,
    transactionAt: r.transactionTime,
    direction: (r.direction || 'single').toLowerCase(),
    vehicleClass: r.vehicleClass,
    raw: r,
  }));
}

async function getBalance(accountId) {
  if (!env.flags.hdfcFastag || !env.HDFC_FASTAG_BASE_URL || !accountId) return null;
  const resp = await axios.get(`${env.HDFC_FASTAG_BASE_URL}/fastag/balance`, {
    headers: authHeaders(),
    params: { tagId: accountId },
    timeout: 15000,
  });
  return resp.data && typeof resp.data.balance === 'number' ? resp.data.balance : null;
}

module.exports = { getTransactions, getBalance };
