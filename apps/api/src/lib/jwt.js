'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Build the access-token payload (TMS Architecture §3.3).
 * @param {object} user prisma user (with role + permissions resolved)
 * @param {string[]} permissions flattened "resource:action" strings
 */
function buildPayload(user, permissions) {
  return {
    userId: user.id,
    role: user.role ? user.role.name : user.roleName,
    name: user.name,
    branchId: user.branchId ?? null,
    permissions: permissions || [],
  };
}

/** Sign a short-lived access token. */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
}

/** Sign a long-lived refresh token (minimal payload). */
function signRefreshToken(user) {
  return jwt.sign({ userId: user.id, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

/** Verify an access token; throws on invalid/expired. */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/** Verify a refresh token; throws on invalid/expired. */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/** httpOnly cookie options (TMS Architecture §17.3). */
function cookieOptions(maxAgeSec) {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    maxAge: maxAgeSec * 1000,
    path: '/',
  };
}

module.exports = {
  buildPayload,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  cookieOptions,
};
