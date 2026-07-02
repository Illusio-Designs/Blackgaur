'use strict';

const express = require('express');
const ctrl = require('../controllers/tracking.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

// Available provider adapters (for the fleet dropdown + settings).
router.get('/providers', hasPermission('trips', 'read'), wrap(ctrl.providers));
// Live positions for the tracking map.
router.get('/live', hasPermission('trips', 'read'), wrap(ctrl.live));
// Pull latest positions from every configured pull-provider.
router.post('/sync', hasPermission('trips', 'update'), wrap(ctrl.sync));
// Device/provider webhook ingest. In production this would authenticate the
// device via a shared secret; here it reuses the session + trips:update RBAC.
router.post('/ping', hasPermission('trips', 'update'), validate({ body: ctrl.schemas.pingSchema }), wrap(ctrl.ping));

module.exports = router;
