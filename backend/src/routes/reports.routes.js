'use strict';

const express = require('express');
const ctrl = require('../controllers/reports.controller');
const audit = require('../controllers/audit.controller');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/dashboard', hasPermission('reports', 'read'), wrap(ctrl.dashboard));
router.get('/trips', hasPermission('reports', 'read'), wrap(ctrl.trips));
router.get('/finance', hasPermission('reports', 'read'), wrap(ctrl.finance));
router.get('/fastag', hasPermission('reports', 'read'), wrap(ctrl.fastag));
router.get('/fuel', hasPermission('reports', 'read'), wrap(ctrl.fuel));
router.get('/clients', hasPermission('reports', 'read'), wrap(ctrl.clients));
router.get('/audit', hasPermission('audit_logs', 'read'), wrap(audit.list));

module.exports = router;
