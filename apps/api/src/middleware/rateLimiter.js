'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API limiter. */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } },
});

/**
 * Strict OTP limiter (TMS Architecture §3.2): OTP_MAX_ATTEMPTS per mobile per 15 min,
 * then a 1-hour lockout. Keyed by mobile (body) falling back to IP.
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.OTP_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body && req.body.mobile ? `otp:${req.body.mobile}` : `otp:${req.ip}`),
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMITED',
      message: 'Too many OTP attempts. Please try again after some time.',
    },
  },
});

module.exports = { generalLimiter, otpLimiter };
