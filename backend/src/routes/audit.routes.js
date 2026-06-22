'use strict';

const express = require('express');
const ctrl = require('../controllers/audit.controller');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

// Immutable, read-only audit log (TMS Architecture §10).
router.get('/', hasPermission('audit_logs', 'read'), wrap(ctrl.list));

module.exports = router;
