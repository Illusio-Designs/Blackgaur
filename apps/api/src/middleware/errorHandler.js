'use strict';

const AppError = require('../lib/AppError');
const { fail } = require('../lib/response');
const env = require('../config/env');

/** 404 handler for unmatched routes. */
function notFound(req, res) {
  return fail(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
}

/**
 * Central error handler -> standard error envelope.
 * Translates Prisma + Zod errors into clean HTTP responses.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return fail(res, err.status, err.code, err.message, err.details);
  }

  // Zod validation error (when thrown directly).
  if (err && err.name === 'ZodError') {
    return fail(res, 400, 'VALIDATION_ERROR', 'Validation failed', err.issues);
  }

  // Prisma known request errors.
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return fail(res, 409, 'CONFLICT', 'A record with this unique value already exists', err.meta);
    }
    if (err.code === 'P2025') {
      return fail(res, 404, 'NOT_FOUND', 'Record not found');
    }
    if (err.code === 'P2003') {
      return fail(res, 400, 'BAD_REQUEST', 'Related record does not exist (foreign key constraint)', err.meta);
    }
    return fail(res, 400, 'DB_ERROR', 'Database request error', env.isProd ? undefined : err.meta);
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);
  return fail(
    res,
    500,
    'INTERNAL_ERROR',
    env.isProd ? 'Internal server error' : err.message || 'Internal server error'
  );
}

module.exports = { notFound, errorHandler };
