'use strict';

const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');

const SORTABLE = ['createdAt', 'action', 'resourceType'];

/** GET /reports/audit (and /audit-logs) — immutable, read-only */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE });
  const where = { ...q.where };
  const filters = { ...q.filtersApplied };

  if (raw.user_id) {
    where.userId = Number(raw.user_id);
    filters.user_id = Number(raw.user_id);
  }
  if (raw.action) {
    where.action = { contains: String(raw.action) };
    filters.action = raw.action;
  }
  if (raw.resource_type) {
    where.resourceType = String(raw.resource_type);
    filters.resource_type = raw.resource_type;
  }

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

module.exports = { list };
