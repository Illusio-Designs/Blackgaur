'use strict';

const prisma = require('../lib/prisma');

/**
 * Strip Decimal/BigInt/Date to JSON-safe snapshot for audit storage.
 */
function snapshot(obj) {
  if (obj === null || obj === undefined) return null;
  try {
    return JSON.parse(
      JSON.stringify(obj, (_k, v) => {
        if (typeof v === 'bigint') return v.toString();
        if (v && typeof v === 'object' && v.constructor && v.constructor.name === 'Decimal') {
          return Number(v.toString());
        }
        return v;
      })
    );
  } catch (_e) {
    return null;
  }
}

/**
 * Write an immutable audit log entry (TMS Architecture §10.2).
 * Never throws into the request flow — audit failure must not break the action.
 *
 * @param {import('express').Request} req
 * @param {string} action e.g. "trip.created"
 * @param {string} resourceType e.g. "trips"
 * @param {number|null} resourceId
 * @param {object|null} [before]
 * @param {object|null} [after]
 * @param {string} [resourceLabel]
 */
async function auditLog(req, action, resourceType, resourceId, before, after, resourceLabel) {
  try {
    const user = (req && req.user) || {};
    await prisma.auditLog.create({
      data: {
        userId: user.userId ?? null,
        userName: user.name ?? null,
        userRole: user.role ?? null,
        action,
        resourceType,
        resourceId: resourceId != null ? Number(resourceId) : null,
        resourceLabel: resourceLabel ?? null,
        beforeState: before ? snapshot(before) : undefined,
        afterState: after ? snapshot(after) : undefined,
        ipAddress: req ? req.ip : null,
        userAgent: req && req.headers ? String(req.headers['user-agent'] || '').slice(0, 200) : null,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[audit] failed to write audit log:', e.message);
  }
}

module.exports = { auditLog, snapshot };
