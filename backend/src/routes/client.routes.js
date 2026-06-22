'use strict';

const express = require('express');
const ctrl = require('../controllers/client.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('clients', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('clients', 'read'), wrap(ctrl.getOne));
router.post('/', hasPermission('clients', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.put('/:id', hasPermission('clients', 'update'), validate({ body: ctrl.schemas.updateSchema }), wrap(ctrl.update));
router.delete('/:id', hasPermission('clients', 'delete'), wrap(ctrl.remove));

module.exports = router;
