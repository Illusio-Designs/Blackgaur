'use strict';

const axios = require('axios');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const env = require('../../config/env');

/**
 * IHMCL / NETC FASTag API client (TMS Architecture §6.2).
 * Guarded by env: when IHMCL credentials are absent it returns deterministic stub data
 * so the API boots & syncs with zero external dependencies.
 */

function authHeaders() {
  return {
    'X-Client-Id': env.IHMCL_CLIENT_ID,
    'X-Client-Secret': env.IHMCL_CLIENT_SECRET,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch toll transactions for an account since a timestamp.
 * @param {string} accountId api_account_id of the wallet
 * @param {Date|null} since
 * @returns {Promise<Array<object>>} normalized transaction objects
 */
async function getTransactions(accountId, since) {
  if (!env.flags.ihmcl || !accountId) {
    return stubTransactions(accountId);
  }
  const resp = await axios.get(`${env.IHMCL_BASE_URL}/transactions`, {
    headers: authHeaders(),
    params: { accountId, since: since ? dayjs(since).toISOString() : undefined },
    timeout: 15000,
  });
  const rows = (resp.data && resp.data.transactions) || [];
  return rows.map(normalize);
}

/**
 * Fetch current wallet balance.
 * @param {string} accountId
 * @returns {Promise<number|null>}
 */
async function getBalance(accountId) {
  if (!env.flags.ihmcl || !accountId) return null;
  const resp = await axios.get(`${env.IHMCL_BASE_URL}/balance`, {
    headers: authHeaders(),
    params: { accountId },
    timeout: 15000,
  });
  return resp.data && typeof resp.data.balance === 'number' ? resp.data.balance : null;
}

/** Normalize a raw IHMCL row into the internal transaction shape. */
function normalize(r) {
  return {
    id: r.txnId || r.transactionId || r.id,
    plazaName: r.plazaName || r.tollPlaza,
    plazaCode: r.plazaCode,
    highway: r.highway || r.road,
    amount: Number(r.amount || r.tollAmount || 0),
    balanceAfter: r.balanceAfter != null ? Number(r.balanceAfter) : null,
    transactionAt: r.readerTime || r.txnTime || r.transactionAt,
    direction: (r.direction || 'single').toLowerCase(),
    vehicleClass: r.vehicleClass || r.avc,
    raw: r,
  };
}

/** Deterministic stub feed (empty by default; returns nothing to avoid noise). */
function stubTransactions() {
  // Returning [] keeps sync idempotent and side-effect-free without credentials.
  return [];
}

/** Helper used by tests/dev to fabricate a single stub txn if needed. */
function makeStubTransaction(overrides = {}) {
  return Object.assign(
    {
      id: `ihmcl_${nanoid(10)}`,
      plazaName: 'Demo Toll Plaza',
      plazaCode: 'GJ001',
      highway: 'NH-48',
      amount: 145,
      balanceAfter: null,
      transactionAt: new Date().toISOString(),
      direction: 'single',
      vehicleClass: 'VC7',
      raw: { stub: true },
    },
    overrides
  );
}

module.exports = { getTransactions, getBalance, makeStubTransaction };
