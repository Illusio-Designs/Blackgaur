'use strict';

const AppError = require('../lib/AppError');

/**
 * Zod validation middleware. Validates and coerces req.body/query/params against
 * the provided schemas, replacing each with the parsed result.
 *
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        // Express query is read-only on newer versions; store parsed copy.
        req.validatedQuery = schemas.query.parse(req.query);
      }
      if (schemas.body) req.body = schemas.body.parse(req.body);
      return next();
    } catch (err) {
      if (err && err.name === 'ZodError') {
        const issues = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return next(AppError.badRequest('Validation failed', issues));
      }
      return next(err);
    }
  };
}

module.exports = validate;
