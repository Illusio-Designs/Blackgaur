'use strict';

const express = require('express');
const ctrl = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('vehicles', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('vehicles', 'read'), wrap(ctrl.getOne));
router.post('/', hasPermission('vehicles', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.put('/:id', hasPermission('vehicles', 'update'), validate({ body: ctrl.schemas.updateSchema }), wrap(ctrl.update));
router.delete('/:id', hasPermission('vehicles', 'delete'), wrap(ctrl.remove));

module.exports = router;
