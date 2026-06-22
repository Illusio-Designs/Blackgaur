'use strict';

const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend root if present.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** @param {string} key @param {string} [fallback] */
function str(key, fallback = '') {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
}

/** @param {string} key @param {number} fallback */
function num(key, fallback) {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const NODE_ENV = str('NODE_ENV', 'development');
const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const env = {
  NODE_ENV,
  isProd,
  isTest,
  PORT: num('PORT', 4000),
  CORS_ORIGIN: str('CORS_ORIGIN', 'http://localhost:3000'),

  DATABASE_URL: str('DATABASE_URL', ''),

  JWT_SECRET: str('JWT_SECRET', 'dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: str('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
  JWT_ACCESS_EXPIRY: num('JWT_ACCESS_EXPIRY', 900),
  JWT_REFRESH_EXPIRY: num('JWT_REFRESH_EXPIRY', 604800),

  MSG91_AUTH_KEY: str('MSG91_AUTH_KEY', ''),
  MSG91_FLOW_ID: str('MSG91_FLOW_ID', ''),
  MSG91_SENDER_ID: str('MSG91_SENDER_ID', 'TMSAPP'),
  MSG91_DLT_TE_ID: str('MSG91_DLT_TE_ID', ''),
  OTP_EXPIRY_SEC: num('OTP_EXPIRY_SEC', 300),
  OTP_MAX_ATTEMPTS: num('OTP_MAX_ATTEMPTS', 3),
  RESEND_COOLDOWN: num('RESEND_COOLDOWN', 60),

  IHMCL_CLIENT_ID: str('IHMCL_CLIENT_ID', ''),
  IHMCL_CLIENT_SECRET: str('IHMCL_CLIENT_SECRET', ''),
  IHMCL_BASE_URL: str('IHMCL_BASE_URL', 'https://api.ihmcl.com/netc/v1'),
  HDFC_FASTAG_API_KEY: str('HDFC_FASTAG_API_KEY', ''),
  HDFC_FASTAG_BASE_URL: str('HDFC_FASTAG_BASE_URL', ''),
  FASTAG_SYNC_CRON: str('FASTAG_SYNC_CRON', '*/15 * * * *'),

  HPCL_FLEET_API_KEY: str('HPCL_FLEET_API_KEY', ''),
  HPCL_FLEET_CLIENT_ID: str('HPCL_FLEET_CLIENT_ID', ''),
  HPCL_FLEET_BASE_URL: str('HPCL_FLEET_BASE_URL', ''),
  IOCL_FLEET_API_KEY: str('IOCL_FLEET_API_KEY', ''),
  IOCL_FLEET_BASE_URL: str('IOCL_FLEET_BASE_URL', ''),
  BPCL_FLEET_API_KEY: str('BPCL_FLEET_API_KEY', ''),
  FUEL_SYNC_CRON: str('FUEL_SYNC_CRON', '*/30 * * * *'),
  DOC_EXPIRY_CRON: str('DOC_EXPIRY_CRON', '0 7 * * *'),

  AWS_S3_BUCKET: str('AWS_S3_BUCKET', ''),
  AWS_REGION: str('AWS_REGION', 'ap-south-1'),
  AWS_ACCESS_KEY_ID: str('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: str('AWS_SECRET_ACCESS_KEY', ''),

  ENCRYPTION_KEY: str('ENCRYPTION_KEY', '0'.repeat(64)),

  REDIS_URL: str('REDIS_URL', ''),

  COMPANY_NAME: str('COMPANY_NAME', 'Blackgaur Logistics Pvt Ltd'),
  COMPANY_ADDRESS: str('COMPANY_ADDRESS', ''),
  COMPANY_GSTIN: str('COMPANY_GSTIN', ''),
  COMPANY_PAN: str('COMPANY_PAN', ''),
  COMPANY_STATE_CODE: str('COMPANY_STATE_CODE', '24'),
  COMPANY_BANK_NAME: str('COMPANY_BANK_NAME', ''),
  COMPANY_BANK_ACCOUNT: str('COMPANY_BANK_ACCOUNT', ''),
  COMPANY_BANK_IFSC: str('COMPANY_BANK_IFSC', ''),

  SEED_ADMIN_MOBILE: str('SEED_ADMIN_MOBILE', '9000000001'),
  SEED_ADMIN_NAME: str('SEED_ADMIN_NAME', 'System Administrator'),

  // upload limits
  MAX_UPLOAD_BYTES: num('MAX_UPLOAD_BYTES', 10 * 1024 * 1024),
};

// Feature flags derived from credentials presence.
env.flags = {
  msg91: Boolean(env.MSG91_AUTH_KEY && env.MSG91_FLOW_ID),
  ihmcl: Boolean(env.IHMCL_CLIENT_ID && env.IHMCL_CLIENT_SECRET),
  hdfcFastag: Boolean(env.HDFC_FASTAG_API_KEY),
  hpcl: Boolean(env.HPCL_FLEET_API_KEY),
  iocl: Boolean(env.IOCL_FLEET_API_KEY),
  s3: Boolean(env.AWS_S3_BUCKET && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
};

/**
 * Validate critical secrets. Throws in production when defaults are still in use.
 */
function validateProdSecrets() {
  if (!isProd) return;
  const problems = [];
  if (!env.DATABASE_URL) problems.push('DATABASE_URL is required in production');
  if (env.JWT_SECRET.includes('change-me') || env.JWT_SECRET.includes('dev-')) {
    problems.push('JWT_SECRET must be set to a strong secret in production');
  }
  if (env.JWT_REFRESH_SECRET.includes('change-me') || env.JWT_REFRESH_SECRET.includes('dev-')) {
    problems.push('JWT_REFRESH_SECRET must be set to a strong secret in production');
  }
  if (!/^[0-9a-fA-F]{64}$/.test(env.ENCRYPTION_KEY) || env.ENCRYPTION_KEY === '0'.repeat(64)) {
    problems.push('ENCRYPTION_KEY must be a unique 64-char hex (32 byte) value in production');
  }
  if (problems.length) {
    throw new Error('Insecure production configuration:\n - ' + problems.join('\n - '));
  }
}

env.validateProdSecrets = validateProdSecrets;

module.exports = env;
