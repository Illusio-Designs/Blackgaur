'use strict';

/**
 * Typed application error carrying an HTTP status + machine code.
 */
class AppError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} code machine-readable error code (e.g. NOT_FOUND)
   * @param {string} message human-readable message
   * @param {*} [details] optional structured detail (e.g. zod issues)
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, AppError);
  }

  static badRequest(message = 'Bad request', details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }
  static conflict(message = 'Resource conflict', details) {
    return new AppError(409, 'CONFLICT', message, details);
  }
  static tooMany(message = 'Too many requests') {
    return new AppError(429, 'RATE_LIMITED', message);
  }
  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}

module.exports = AppError;
