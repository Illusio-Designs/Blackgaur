'use strict';

const express = require('express');
const ctrl = require('../controllers/fastag.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

// ── Wallets ──
router.get('/wallets', hasPermission('fastag_wallets', 'read'), wrap(ctrl.listWallets));
router.get('/wallets/:id', hasPermission('fastag_wallets', 'read'), wrap(ctrl.getWallet));
router.post('/wallets', hasPermission('fastag_wallets', 'create'), validate({ body: ctrl.schemas.createWalletSchema }), wrap(ctrl.createWallet));
router.patch('/wallets/:id', hasPermission('fastag_wallets', 'update'), validate({ body: ctrl.schemas.patchWalletSchema }), wrap(ctrl.patchWallet));
router.post('/wallets/:id/sync-balance', hasPermission('fastag_wallets', 'read'), wrap(ctrl.syncBalance));
router.post('/wallets/:id/recharge', hasPermission('fastag_wallets', 'recharge'), validate({ body: ctrl.schemas.rechargeSchema }), wrap(ctrl.recharge));

// ── Transactions ──
router.get('/transactions', hasPermission('fastag_transactions', 'read'), wrap(ctrl.listTransactions));
router.get('/transactions/export', hasPermission('fastag_transactions', 'export'), wrap(ctrl.exportTransactions));
router.post('/transactions/sync', hasPermission('fastag_transactions', 'read'), validate({ body: ctrl.schemas.syncSchema }), wrap(ctrl.syncTransactions));
router.post('/transactions/match-trips', hasPermission('fastag_transactions', 'read'), wrap(ctrl.matchTrips));

module.exports = router;
