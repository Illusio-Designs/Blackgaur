'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');
const { auditLog } = require('../middleware/auditLogger');

const CONFIG_ID = 1;

/**
 * Default app configuration for a fresh single-company deployment
 * (TMS Architecture §8 RCM/GST, §13, §17). ADMIN-ONLY — never exposed by the
 * public branding endpoint. Contains no secrets / API keys (those live in .env).
 * Mirrored by prisma/seed.js and frontend src/lib/config.js.
 */
const DEFAULT_CONFIG = {
  company: {
    legalName: 'TransCo Logistics Pvt Ltd',
    gstin: '24ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    stateCode: '24',
    cin: '',
    registeredAddress: 'Plot 12, Transport Nagar, Ahmedabad, Gujarat 380016',
    bankName: 'HDFC Bank',
    bankAccount: '50200012345678',
    ifsc: 'HDFC0001234',
    financialYear: '2024-25',
    invoicePrefix: 'INV',
  },
  tax: {
    rcmDefault: true,
    gstRate: 5,
    itcEnabled: false,
    tdsRate: 2,
    tdsSection: '194C',
    placeOfSupplyAuto: true,
  },
  integrations: {
    otpProvider: 'MSG91',
    msg91SenderId: 'TMSAPP',
    fastagProvider: 'IHMCL',
    fastagLowBalanceDefault: 200,
    fuelProviders: ['HPCL', 'IOCL'],
    fastagSyncCron: '*/15 * * * *',
    fuelSyncCron: '*/30 * * * *',
  },
  alerts: {
    lowBalanceThreshold: 200,
    docExpiryLeadDays: 30,
    notifyEmail: true,
    notifySms: false,
  },
};

// ── Validation (all fields optional; nested objects .passthrough()) ──
const companySchema = z
  .object({
    legalName: z.string().max(180).optional(),
    gstin: z.string().max(20).optional(),
    pan: z.string().max(15).optional(),
    stateCode: z.string().max(2).optional(),
    cin: z.string().max(30).optional(),
    registeredAddress: z.string().max(500).optional(),
    bankName: z.string().max(120).optional(),
    bankAccount: z.string().max(40).optional(),
    ifsc: z.string().max(15).optional(),
    financialYear: z.string().max(10).optional(),
    invoicePrefix: z.string().max(10).optional(),
  })
  .passthrough();

const taxSchema = z
  .object({
    rcmDefault: z.boolean().optional(),
    // GST rate restricted to the slabs the TMS supports (§8.2): 0 / 5 / 12.
    gstRate: z.union([z.literal(0), z.literal(5), z.literal(12)]).optional(),
    itcEnabled: z.boolean().optional(),
    tdsRate: z.number().min(0).max(100).optional(),
    tdsSection: z.string().max(10).optional(),
    placeOfSupplyAuto: z.boolean().optional(),
  })
  .passthrough();

const integrationsSchema = z
  .object({
    otpProvider: z.string().max(40).optional(),
    msg91SenderId: z.string().max(20).optional(),
    fastagProvider: z.string().max(40).optional(),
    fastagLowBalanceDefault: z.number().min(0).optional(),
    fuelProviders: z.array(z.string().max(20)).optional(),
    fastagSyncCron: z.string().max(60).optional(),
    fuelSyncCron: z.string().max(60).optional(),
  })
  .passthrough();

const alertsSchema = z
  .object({
    lowBalanceThreshold: z.number().min(0).optional(),
    docExpiryLeadDays: z.number().int().min(0).max(365).optional(),
    notifyEmail: z.boolean().optional(),
    notifySms: z.boolean().optional(),
  })
  .passthrough();

const updateSchema = z
  .object({
    company: companySchema.optional(),
    tax: taxSchema.optional(),
    integrations: integrationsSchema.optional(),
    alerts: alertsSchema.optional(),
  })
  // Unknown top-level keys are ignored (stripped) rather than rejected.
  .strip();

/**
 * Shallow deep-merge: for each top-level config section, merge incoming keys
 * over the existing JSON object. Returns a new object (does not mutate base).
 * @param {object} base
 * @param {object} patch
 */
function mergeSection(base, patch) {
  return { ...(base || {}), ...(patch || {}) };
}

/**
 * Fetch the singleton app_config row, creating it from defaults if missing.
 * @returns {Promise<object>}
 */
async function getOrCreateConfig() {
  let config = await prisma.appConfig.findUnique({ where: { id: CONFIG_ID } });
  if (!config) {
    config = await prisma.appConfig.create({ data: { id: CONFIG_ID, ...DEFAULT_CONFIG } });
  }
  return config;
}

/**
 * Public-safe view of the config row (just the four JSON sections).
 * @param {object} row
 */
function toView(row) {
  return {
    company: row.company ?? DEFAULT_CONFIG.company,
    tax: row.tax ?? DEFAULT_CONFIG.tax,
    integrations: row.integrations ?? DEFAULT_CONFIG.integrations,
    alerts: row.alerts ?? DEFAULT_CONFIG.alerts,
  };
}

/**
 * GET /settings/config — admin only (settings:read).
 * Returns the singleton config, auto-creating it from defaults if missing.
 */
async function getConfig(_req, res) {
  const config = await getOrCreateConfig();
  return ok(res, toView(config));
}

/**
 * PUT /settings/config — admin only (settings:update).
 * Partial deep-merge update of company/tax/integrations/alerts JSON sections.
 * Emits config.updated, plus rcm_toggle.changed / company_profile.updated when
 * the relevant sections change (TMS Architecture §10.1 verbatim action strings).
 */
async function updateConfig(req, res) {
  const before = await getOrCreateConfig();
  const b = req.body;

  const data = {};
  if (b.company !== undefined) data.company = mergeSection(before.company, b.company);
  if (b.tax !== undefined) data.tax = mergeSection(before.tax, b.tax);
  if (b.integrations !== undefined) data.integrations = mergeSection(before.integrations, b.integrations);
  if (b.alerts !== undefined) data.alerts = mergeSection(before.alerts, b.alerts);

  const after = await prisma.appConfig.update({ where: { id: CONFIG_ID }, data });

  await auditLog(req, 'config.updated', 'app_config', CONFIG_ID, toView(before), toView(after));

  // Additional, category-specific audit entries (§10.1).
  const beforeTax = before.tax || {};
  const afterTax = after.tax || {};
  if (b.tax !== undefined && beforeTax.rcmDefault !== afterTax.rcmDefault) {
    await auditLog(
      req,
      'rcm_toggle.changed',
      'app_config',
      CONFIG_ID,
      { rcmDefault: beforeTax.rcmDefault },
      { rcmDefault: afterTax.rcmDefault }
    );
  }
  if (b.company !== undefined) {
    await auditLog(
      req,
      'company_profile.updated',
      'app_config',
      CONFIG_ID,
      before.company,
      after.company,
      (after.company && after.company.legalName) || undefined
    );
  }

  return ok(res, toView(after));
}

module.exports = {
  schemas: { updateSchema },
  DEFAULT_CONFIG,
  getOrCreateConfig,
  getConfig,
  updateConfig,
};
