'use strict';

const express = require('express');
const ctrl = require('../controllers/payment.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

// Payments are settlements against invoices, gated by invoice permissions.
router.get('/', hasPermission('invoices', 'read'), wrap(ctrl.list));
router.get('/tds-journal', hasPermission('invoices', 'read'), wrap(ctrl.tdsJournal));
router.post('/', hasPermission('invoices', 'update'), validate({ body: ctrl.schemas.recordSchema }), wrap(ctrl.record));

module.exports = router;
