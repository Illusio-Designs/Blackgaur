'use strict';

/**
 * Convert BigInt/Decimal values to JSON-safe primitives recursively.
 * Prisma returns BigInt for UnsignedBigInt PKs and Decimal objects for DECIMAL columns.
 */
function serialize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') {
    // Prisma.Decimal exposes toFixed/toString; detect via constructor name.
    if (value.constructor && value.constructor.name === 'Decimal') {
      return Number(value.toString());
    }
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(serialize);
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
}

/**
 * Standard success envelope (TMS Architecture §5.1).
 * @param {import('express').Response} res
 * @param {*} data
 * @param {{ meta?: object, filters_applied?: object, status?: number }} [opts]
 */
function ok(res, data, opts = {}) {
  const body = { success: true, data: serialize(data) };
  if (opts.meta) body.meta = opts.meta;
  if (opts.filters_applied) body.filters_applied = opts.filters_applied;
  return res.status(opts.status || 200).json(body);
}

/**
 * Standard failure envelope.
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} code
 * @param {string} message
 * @param {*} [details]
 */
function fail(res, status, code, message, details) {
  const error = { code, message };
  if (details !== undefined) error.details = serialize(details);
  return res.status(status).json({ success: false, error });
}

module.exports = { ok, fail, serialize };
