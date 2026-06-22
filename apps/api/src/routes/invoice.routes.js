'use strict';

const express = require('express');
const ctrl = require('../controllers/invoice.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

router.get('/', hasPermission('invoices', 'read'), wrap(ctrl.list));
router.get('/:id', hasPermission('invoices', 'read'), wrap(ctrl.getOne));
router.get('/:id/pdf', hasPermission('invoices', 'read'), ctrl.pdf);
router.post('/', hasPermission('invoices', 'create'), validate({ body: ctrl.schemas.createSchema }), wrap(ctrl.create));
router.patch('/:id/approve', hasPermission('invoices', 'approve'), validate({ body: ctrl.schemas.approveSchema }), wrap(ctrl.approve));
router.patch('/:id/mark-paid', hasPermission('invoices', 'update'), validate({ body: ctrl.schemas.markPaidSchema }), wrap(ctrl.markPaid));
router.post('/:id/send', hasPermission('invoices', 'update'), validate({ body: ctrl.schemas.sendSchema }), wrap(ctrl.send));
router.delete('/:id', hasPermission('invoices', 'delete'), wrap(ctrl.remove));

module.exports = router;
