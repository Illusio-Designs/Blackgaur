'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { auditLog } = require('../middleware/auditLogger');
const { uploadFile } = require('../services/s3.service');

const BRANDING_ID = 1;

// Logo / favicon uploads accept image formats only (TMS Architecture §13.3, §17.3).
const LOGO_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);
const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5MB

const VARIANT_COLUMN = {
  logo: 'logoUrl',
  logo_dark: 'logoDarkUrl',
  favicon: 'faviconUrl',
};

/**
 * Default branding for a fresh single-company deployment (TMS Architecture §13, §14).
 * Clearly overridable from the admin panel. Mirrored by prisma/seed.js.
 */
const DEFAULT_BRANDING = {
  companyName: 'TransCo Logistics',
  legalName: 'TransCo Logistics Pvt Ltd',
  tagline: 'Freight delivered on time, across India',
  logoUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  theme: { sidebar: '#0B1E3D', primary: '#1A56DB', accent: '#D97706' },
  contact: {
    email: 'ops@transco.in',
    phone: '+91 79 4000 1234',
    whatsapp: '+919900000000',
    addressLine: 'Plot 12, Transport Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gstin: '24ABCDE1234F1Z5',
  },
  social: { linkedin: '', instagram: '', facebook: '', twitter: '' },
  content: {
    hero: {
      title: 'Your goods, delivered on time — across India',
      subtitle:
        'Full-truck-load, part-load and container movement backed by a GPS + FASTag-enabled fleet and GST-compliant billing.',
      ctaPrimary: 'Get a quote',
      ctaSecondary: 'Track shipment',
    },
    stats: [
      { value: '50,000+', label: 'Trips delivered' },
      { value: '1,200+', label: 'Vehicles in network' },
      { value: '480+', label: 'Cities covered' },
      { value: '99.2%', label: 'On-time delivery' },
    ],
    services: [
      { key: 'ftl', title: 'Full Truck Load (FTL)', description: 'Dedicated trucks for bulk consignments, point to point.' },
      { key: 'ptl', title: 'Part Load (PTL)', description: 'Cost-efficient shared-load movement for smaller consignments.' },
      { key: 'container', title: 'Container & ODC', description: 'Containerised and over-dimensional cargo across highways and ports.' },
      { key: 'coldchain', title: 'Cold Chain', description: 'Temperature-controlled reefer trucks for perishables and pharma.' },
      { key: 'warehousing', title: 'Warehousing', description: 'Storage, cross-dock and distribution from strategic hubs.' },
      { key: 'lastmile', title: 'Last-mile', description: 'Reliable city distribution and final-mile delivery.' },
    ],
    why: [
      { title: 'Live GPS tracking', description: 'Track every shipment by LR number in real time.' },
      { title: 'FASTag-enabled fleet', description: 'Seamless toll movement and transparent trip costs.' },
      { title: 'GST & RCM compliant', description: 'Correct invoicing with e-way bill and reverse-charge handling.' },
      { title: 'Pan-India network', description: 'Branches and partners across major industrial corridors.' },
    ],
    about: {
      heading: 'Built for Indian road transport',
      body: 'We move freight for manufacturers, distributors and e-commerce businesses with a modern, technology-driven fleet operation.',
    },
  },
};

// ── Validation (TMS Architecture §6 — all fields optional, nested JSON passthrough) ──
const themeSchema = z
  .object({ sidebar: z.string().optional(), primary: z.string().optional(), accent: z.string().optional() })
  .passthrough();

const contactSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    addressLine: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    gstin: z.string().optional(),
  })
  .passthrough();

const socialSchema = z
  .object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  })
  .passthrough();

// Public website content — free-form JSON, validated loosely (passthrough) so the
// admin can extend sections without a schema migration.
const contentSchema = z.object({}).passthrough();

const updateSchema = z
  .object({
    company_name: z.string().min(1).max(150).optional(),
    legal_name: z.string().max(180).nullable().optional(),
    tagline: z.string().max(200).nullable().optional(),
    theme: themeSchema.optional(),
    contact: contactSchema.optional(),
    social: socialSchema.optional(),
    content: contentSchema.optional(),
  })
  // Unknown top-level keys are ignored (stripped) rather than rejected.
  .strip();

const variantSchema = z.object({
  variant: z.enum(['logo', 'logo_dark', 'favicon']).optional(),
});

/**
 * Fetch the singleton branding row, creating it from defaults if missing.
 * @returns {Promise<object>}
 */
async function getOrCreateBranding() {
  let branding = await prisma.branding.findUnique({ where: { id: BRANDING_ID } });
  if (!branding) {
    branding = await prisma.branding.create({ data: { id: BRANDING_ID, ...DEFAULT_BRANDING } });
  }
  return branding;
}

/**
 * GET /branding — PUBLIC.
 * Returns the singleton so the public site + dashboard can theme themselves.
 * Contains no secrets / API keys.
 */
async function getBranding(_req, res) {
  const branding = await getOrCreateBranding();
  return ok(res, branding);
}

/**
 * PUT /settings/branding — admin only.
 * Partial update of company_name, legal_name, tagline, theme, contact, social, content.
 */
async function updateBranding(req, res) {
  const before = await getOrCreateBranding();

  const b = req.body;
  const data = {};
  if (b.company_name !== undefined) data.companyName = b.company_name;
  if (b.legal_name !== undefined) data.legalName = b.legal_name === '' ? null : b.legal_name;
  if (b.tagline !== undefined) data.tagline = b.tagline === '' ? null : b.tagline;
  if (b.theme !== undefined) data.theme = b.theme;
  if (b.contact !== undefined) data.contact = b.contact;
  if (b.social !== undefined) data.social = b.social;
  if (b.content !== undefined) data.content = b.content;

  const branding = await prisma.branding.update({ where: { id: BRANDING_ID }, data });
  await auditLog(req, 'company_profile.updated', 'branding', BRANDING_ID, before, branding, branding.companyName);
  return ok(res, branding);
}

/**
 * POST /settings/branding/logo — admin only, multipart field `file`.
 * Query/body `variant` in {logo, logo_dark, favicon}; defaults to "logo".
 */
async function uploadLogo(req, res) {
  if (!req.file) throw AppError.badRequest('Logo file is required (field "file")');

  const variant = String((req.body && req.body.variant) || (req.query && req.query.variant) || 'logo');
  const column = VARIANT_COLUMN[variant];
  if (!column) {
    throw AppError.badRequest('Invalid variant. Expected one of: logo, logo_dark, favicon');
  }

  const before = await getOrCreateBranding();

  const uploaded = await uploadFile({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    folder: 'branding',
    allowedMime: LOGO_MIME,
    maxBytes: LOGO_MAX_BYTES,
  });

  const branding = await prisma.branding.update({
    where: { id: BRANDING_ID },
    data: { [column]: uploaded.url },
  });
  await auditLog(
    req,
    'logo.updated',
    'branding',
    BRANDING_ID,
    { [column]: before[column] },
    { [column]: uploaded.url },
    `${branding.companyName} (${variant})`
  );
  return ok(res, branding);
}

module.exports = {
  schemas: { updateSchema, variantSchema },
  DEFAULT_BRANDING,
  LOGO_MIME,
  LOGO_MAX_BYTES,
  getOrCreateBranding,
  getBranding,
  updateBranding,
  uploadLogo,
};
