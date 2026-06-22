'use strict';

const express = require('express');
const ctrl = require('../controllers/fuelCard.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('fuel_transactions', 'read'), wrap(ctrl.listTransactions));
router.get('/export', hasPermission('fuel_transactions', 'export'), wrap(ctrl.exportTransactions));
router.post('/sync', hasPermission('fuel_transactions', 'read'), validate({ body: ctrl.schemas.syncSchema }), wrap(ctrl.syncTransactions));
router.post('/match-trips', hasPermission('fuel_transactions', 'read'), wrap(ctrl.matchTrips));

module.exports = router;
