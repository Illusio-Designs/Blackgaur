'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../lib/AppError');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

/**
 * Validate an uploaded file against MIME + size rules (TMS Architecture §17.3).
 * @param {{ mimetype: string, size: number }} file
 */
function validateFile(file) {
  if (!file) throw AppError.badRequest('No file provided');
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw AppError.badRequest(`Unsupported file type: ${file.mimetype}`);
  }
  if (file.size > env.MAX_UPLOAD_BYTES) {
    throw AppError.badRequest(`File exceeds max size of ${env.MAX_UPLOAD_BYTES} bytes`);
  }
}

/**
 * Upload a buffer to S3 (when configured) or local disk fallback.
 * @param {object} params
 * @param {Buffer} params.buffer
 * @param {string} params.originalName
 * @param {string} params.mimetype
 * @param {number} params.size
 * @param {string} [params.folder] logical folder e.g. "pod" | "receipts"
 * @returns {Promise<{ url: string, key: string, storage: 's3'|'local' }>}
 */
async function uploadFile({ buffer, originalName, mimetype, size, folder = 'misc' }) {
  validateFile({ mimetype, size });

  const ext = path.extname(originalName || '') || mimeToExt(mimetype);
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  if (env.flags.s3) {
    // eslint-disable-next-line global-require
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({
      region: env.AWS_REGION,
      credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
    });
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );
    return { url: `s3://${env.AWS_S3_BUCKET}/${key}`, key, storage: 's3' };
  }

  // ── Local disk fallback ──
  const dest = path.join(UPLOAD_DIR, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  return { url: `/uploads/${key}`, key, storage: 'local' };
}

/**
 * Generate a presigned (time-limited) GET URL for a stored object.
 * Falls back to the local static path when S3 is not configured.
 * @param {string} key
 * @param {number} [expiresSec]
 */
async function presignedUrl(key, expiresSec = 900) {
  if (env.flags.s3) {
    // eslint-disable-next-line global-require
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    // eslint-disable-next-line global-require
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const s3 = new S3Client({
      region: env.AWS_REGION,
      credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
    });
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }), {
      expiresIn: expiresSec,
    });
  }
  return `/uploads/${key}`;
}

function mimeToExt(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'application/pdf': '.pdf',
  };
  return map[mime] || '';
}

module.exports = { uploadFile, presignedUrl, validateFile, ALLOWED_MIME, UPLOAD_DIR };
