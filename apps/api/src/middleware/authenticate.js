'use strict';

const { verifyAccessToken } = require('../lib/jwt');
const AppError = require('../lib/AppError');

/**
 * Read JWT from httpOnly cookie `accessToken` or Authorization: Bearer header,
 * verify it, and attach the decoded payload to req.user.
 */
function authenticate(req, _res, next) {
  let token = null;
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    token = auth.slice(7).trim();
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(AppError.unauthorized('Missing authentication token'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      branchId: payload.branchId ?? null,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    };
    return next();
  } catch (_e) {
    return next(AppError.unauthorized('Invalid or expired token'));
  }
}

module.exports = authenticate;
