'use strict';

const express = require('express');
const ctrl = require('../controllers/role.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('roles', 'read'), wrap(ctrl.list));
router.post('/', hasPermission('roles', 'create'), validate({ body: ctrl.schemas.createRoleSchema }), wrap(ctrl.create));
router.put('/:id/permissions', hasPermission('roles', 'update'), validate({ body: ctrl.schemas.permissionsSchema }), wrap(ctrl.updatePermissions));
router.delete('/:id', hasPermission('roles', 'delete'), wrap(ctrl.remove));

module.exports = router;
