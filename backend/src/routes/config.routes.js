'use strict';

const express = require('express');
const ctrl = require('../controllers/config.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

/**
 * PROTECTED settings/config router — admin-only app configuration
 * (company/GST, tax/RCM, integration preferences, alerts).
 * Mounted under /settings AFTER authenticate, so routes are
 * GET/PUT /v1/settings/config (TMS Architecture §8, §13, §17).
 *
 * Never exposes secrets / API keys — those live in server .env.
 */
const router = express.Router();

router.get('/config', hasPermission('settings', 'read'), wrap(ctrl.getConfig));

router.put(
  '/config',
  hasPermission('settings', 'update'),
  validate({ body: ctrl.schemas.updateSchema }),
  wrap(ctrl.updateConfig)
);

module.exports = router;
