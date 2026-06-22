'use strict';

const express = require('express');
const ctrl = require('../controllers/trip.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const upload = require('../lib/upload');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('trips', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('trips', 'read'), wrap(ctrl.getOne));
router.post('/', hasPermission('trips', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.put('/:id', hasPermission('trips', 'update'), validate({ body: ctrl.schemas.updateSchema }), wrap(ctrl.update));
router.patch('/:id/status', hasPermission('trips', 'update'), validate({ body: ctrl.schemas.statusSchema }), wrap(ctrl.updateStatus));
router.post('/:id/pod', hasPermission('trips', 'update'), upload.single('file'), validate({ body: ctrl.schemas.podSchema }), wrap(ctrl.uploadPod));
router.delete('/:id', hasPermission('trips', 'delete'), wrap(ctrl.remove));

module.exports = router;
