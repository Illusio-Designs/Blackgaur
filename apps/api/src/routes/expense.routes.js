'use strict';

const express = require('express');
const ctrl = require('../controllers/expense.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const upload = require('../lib/upload');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('trip_expenses', 'read'), wrap(ctrl.list));
router.get('/summary', hasPermission('trip_expenses', 'read'), wrap(ctrl.summary));
router.post('/', hasPermission('trip_expenses', 'create'), upload.single('receipt'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.patch('/:id/approve', hasPermission('trip_expenses', 'approve'), validate({ body: ctrl.schemas.approveSchema }), wrap(ctrl.approve));
router.patch('/:id/reject', hasPermission('trip_expenses', 'approve'), validate({ body: ctrl.schemas.rejectSchema }), wrap(ctrl.reject));

module.exports = router;
