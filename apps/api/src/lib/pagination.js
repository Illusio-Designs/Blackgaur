'use strict';

const dayjs = require('dayjs');

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

/**
 * Parse universal list query params (TMS Architecture §5.2) into a Prisma-friendly
 * query plus pagination metadata helpers.
 *
 * @param {object} query req.query
 * @param {object} options
 * @param {string[]} options.sortable whitelist of sortable columns (Prisma field names)
 * @param {string[]} [options.searchable] string fields to OR-match against `search`
 * @param {string[]} [options.includable] allowed relation names for ?include=
 * @param {string} [options.dateField] field used for from_date/to_date (default createdAt)
 * @param {string} [options.defaultSort] default sort field (default createdAt)
 */
function parseListQuery(query = {}, options = {}) {
  const sortable = options.sortable || ['createdAt'];
  const searchable = options.searchable || [];
  const includable = options.includable || [];
  const dateField = options.dateField || 'createdAt';
  const defaultSort = options.defaultSort || (sortable.includes('createdAt') ? 'createdAt' : sortable[0]);

  let page = parseInt(query.page, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  let sortBy = String(query.sort_by || defaultSort);
  if (!sortable.includes(sortBy)) sortBy = defaultSort;

  const sortOrder = String(query.sort_order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  const where = {};
  const filtersApplied = {};

  // Free-text search across whitelisted fields.
  const search = query.search ? String(query.search).trim() : '';
  if (search && searchable.length) {
    where.OR = searchable.map((f) => ({ [f]: { contains: search } }));
    filtersApplied.search = search;
  }

  // Date range on the configured date field.
  const dateFilter = {};
  if (query.from_date && dayjs(query.from_date).isValid()) {
    dateFilter.gte = dayjs(query.from_date).startOf('day').toDate();
    filtersApplied.from_date = query.from_date;
  }
  if (query.to_date && dayjs(query.to_date).isValid()) {
    dateFilter.lte = dayjs(query.to_date).endOf('day').toDate();
    filtersApplied.to_date = query.to_date;
  }
  if (Object.keys(dateFilter).length) where[dateField] = dateFilter;

  // Eager-load relations.
  let include;
  if (query.include) {
    const requested = String(query.include)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => includable.includes(s));
    if (requested.length) {
      include = {};
      for (const rel of requested) include[rel] = true;
      filtersApplied.include = requested;
    }
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    where,
    include,
    filtersApplied,
    sortBy,
    sortOrder,
  };
}

/**
 * Build the standard meta block.
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
function buildMeta(total, page, limit) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { parseListQuery, buildMeta, DEFAULT_LIMIT, MAX_LIMIT };
