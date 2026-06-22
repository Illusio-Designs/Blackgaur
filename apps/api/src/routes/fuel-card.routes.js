'use strict';

const express = require('express');
const ctrl = require('../controllers/fuelCard.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

// ── Cards ──
router.get('/', hasPermission('fuel_cards', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('fuel_cards', 'read'), wrap(ctrl.getOne));
router.post('/', hasPermission('fuel_cards', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.patch('/:id', hasPermission('fuel_cards', 'update'), validate({ body: ctrl.schemas.patchSchema }), wrap(ctrl.patch));
router.post('/:id/sync-balance', hasPermission('fuel_cards', 'read'), wrap(ctrl.syncBalance));
router.post('/:id/block', hasPermission('fuel_cards', 'update'), validate({ body: ctrl.schemas.blockSchema }), wrap(ctrl.block));
router.post('/:id/unblock', hasPermission('fuel_cards', 'update'), wrap(ctrl.unblock));

module.exports = router;
