'use strict';

const express = require('express');
const multer = require('multer');
const ctrl = require('../controllers/branding.controller');
const validate = require('../middleware/validate');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

// Branding-specific multer: in-memory, 5MB cap, image MIME whitelist
// (png/jpeg/svg/webp/ico). The s3.service re-validates with the same set.
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ctrl.LOGO_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ctrl.LOGO_MIME.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

/**
 * PUBLIC branding router — mounted BEFORE authenticate so the public website
 * can read theme/content without a JWT (TMS Architecture §13, §14).
 */
const publicRouter = express.Router();
publicRouter.get('/branding', wrap(ctrl.getBranding));

/**
 * PROTECTED settings router — admin-only edits (settings:update).
 * Mounted under /settings AFTER authenticate.
 */
const settingsRouter = express.Router();
settingsRouter.put(
  '/branding',
  hasPermission('settings', 'update'),
  validate({ body: ctrl.schemas.updateSchema }),
  wrap(ctrl.updateBranding)
);
settingsRouter.post(
  '/branding/logo',
  hasPermission('settings', 'update'),
  logoUpload.single('file'),
  validate({ query: ctrl.schemas.variantSchema }),
  wrap(ctrl.uploadLogo)
);

module.exports = { publicRouter, settingsRouter };
