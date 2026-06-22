'use strict';

const express = require('express');
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { otpLimiter } = require('../middleware/rateLimiter');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.post('/request-otp', otpLimiter, validate({ body: ctrl.schemas.requestOtpSchema }), wrap(ctrl.requestOtp));
router.post('/verify-otp', otpLimiter, validate({ body: ctrl.schemas.verifyOtpSchema }), wrap(ctrl.verifyOtp));
router.post('/refresh', wrap(ctrl.refresh));
router.post('/logout', wrap(ctrl.logout));
router.get('/me', authenticate, wrap(ctrl.me));

module.exports = router;
