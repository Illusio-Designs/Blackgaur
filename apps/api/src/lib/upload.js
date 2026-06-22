'use strict';

const multer = require('multer');
const env = require('../config/env');
const { ALLOWED_MIME } = require('../services/s3.service');

/**
 * Shared multer instance: in-memory storage with size + MIME guards
 * (TMS Architecture §17.3). The buffer is then handed to s3.service.uploadFile.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

module.exports = upload;
