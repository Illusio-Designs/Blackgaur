'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { auditLog } = require('../middleware/auditLogger');
const msg91 = require('../services/msg91.service');
const {
  buildPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} = require('../lib/jwt');

const requestOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

const verifyOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{4,6}$/),
  requestId: z.string().optional(),
});

/** Flatten a user's role permissions into "resource:action[:scope]" strings. */
async function resolvePermissions(roleId) {
  const perms = await prisma.rolePermission.findMany({ where: { roleId } });
  return perms.map((p) => (p.scope && p.scope !== 'all' ? `${p.resource}:${p.action}:${p.scope}` : `${p.resource}:${p.action}`));
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, cookieOptions(env.JWT_ACCESS_EXPIRY));
  res.cookie('refreshToken', refreshToken, cookieOptions(env.JWT_REFRESH_EXPIRY));
}

/** POST /auth/request-otp */
async function requestOtp(req, res) {
  const { mobile } = req.body;
  const user = await prisma.user.findFirst({
    where: { mobile, isActive: true, deletedAt: null },
  });
  // Audit the attempt regardless (without leaking existence on failure).
  if (!user) {
    await auditLog(req, 'otp_requested', 'auth', null, null, { mobile, found: false });
    throw AppError.notFound('No active account found for this mobile number');
  }

  const { requestId, stub } = await msg91.requestOtp(mobile, req.ip);
  await auditLog(req, 'otp_requested', 'auth', user.id, null, { mobile });

  return ok(res, {
    requestId,
    expiresInSec: env.OTP_EXPIRY_SEC,
    resendCooldownSec: env.RESEND_COOLDOWN,
    ...(stub ? { devNote: 'Stub mode: OTP logged to server console' } : {}),
  });
}

/** POST /auth/verify-otp */
async function verifyOtp(req, res) {
  const { mobile, otp, requestId } = req.body;
  const user = await prisma.user.findFirst({
    where: { mobile, isActive: true, deletedAt: null },
    include: { role: true },
  });
  if (!user) {
    await auditLog(req, 'login_failed', 'auth', null, null, { mobile, reason: 'no_user' });
    throw AppError.notFound('No active account found for this mobile number');
  }

  const result = await msg91.verifyOtp(mobile, otp, requestId);
  if (!result.ok) {
    await auditLog(req, 'login_failed', 'auth', user.id, null, { reason: result.reason });
    throw AppError.unauthorized(result.reason || 'OTP verification failed');
  }

  const permissions = await resolvePermissions(user.roleId);
  const payload = buildPayload(user, permissions);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await auditLog(req, 'login_success', 'auth', user.id, null, { mobile });

  return ok(res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role.name,
      roleLabel: user.role.label,
      branchId: user.branchId,
      languagePref: user.languagePref,
      permissions,
    },
  });
}

/** POST /auth/refresh */
async function refresh(req, res) {
  const token = (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;
  if (!token) throw AppError.unauthorized('Missing refresh token');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (_e) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, isActive: true, deletedAt: null },
    include: { role: true },
  });
  if (!user) throw AppError.unauthorized('Account no longer active');

  const permissions = await resolvePermissions(user.roleId);
  const accessToken = signAccessToken(buildPayload(user, permissions));
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  await auditLog(req, 'token_refreshed', 'auth', user.id);
  return ok(res, { accessToken, refreshToken });
}

/** POST /auth/logout */
async function logout(req, res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  if (req.user) await auditLog(req, 'logout', 'auth', req.user.userId);
  return ok(res, { loggedOut: true });
}

/** GET /auth/me */
async function me(req, res) {
  const user = await prisma.user.findFirst({
    where: { id: req.user.userId, deletedAt: null },
    include: { role: true, branch: true },
  });
  if (!user) throw AppError.notFound('User not found');
  return ok(res, {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    role: user.role.name,
    roleLabel: user.role.label,
    branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null,
    languagePref: user.languagePref,
    permissions: req.user.permissions,
    lastLoginAt: user.lastLoginAt,
  });
}

module.exports = {
  schemas: { requestOtpSchema, verifyOtpSchema },
  requestOtp,
  verifyOtp,
  refresh,
  logout,
  me,
  resolvePermissions,
};
