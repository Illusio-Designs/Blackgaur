'use strict';

const express = require('express');
const ctrl = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('users', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('users', 'read'), wrap(ctrl.getOne));
router.post('/', hasPermission('users', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.put('/:id', hasPermission('users', 'update'), validate({ body: ctrl.schemas.updateSchema }), wrap(ctrl.update));
router.patch('/:id/toggle-active', hasPermission('users', 'update'), wrap(ctrl.toggleActive));
router.delete('/:id', hasPermission('users', 'delete'), wrap(ctrl.remove));

module.exports = router;
