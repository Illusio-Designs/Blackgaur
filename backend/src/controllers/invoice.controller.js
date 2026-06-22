'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');
const gstService = require('../services/gst.service');
const { generateInvoicePdf } = require('../services/pdf.service');

const SORTABLE = ['createdAt', 'invoiceNumber', 'totalAmount', 'status', 'dueDate'];
const INCLUDABLE = ['client', 'trip', 'creator', 'approver'];

const createSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  trip_id: z.coerce.number().int().positive().optional().nullable(),
  invoice_type: z.enum(['outward', 'credit_note', 'debit_note']).optional(),
  billing_month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  freight_amount: z.coerce.number().nonnegative(),
  loading_charges: z.coerce.number().nonnegative().optional(),
  unloading_charges: z.coerce.number().nonnegative().optional(),
  detention_charges: z.coerce.number().nonnegative().optional(),
  other_charges: z.coerce.number().nonnegative().optional(),
  is_rcm: z.coerce.boolean().optional(),
  gst_rate: z.coerce.number().min(0).max(28).optional(),
  tds_rate: z.coerce.number().min(0).max(20).optional(),
  invoice_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
});

const markPaidSchema = z.object({
  paid_amount: z.coerce.number().positive(),
  paid_at: z.coerce.date().optional(),
  payment_ref: z.string().max(80).optional(),
});

const approveSchema = z.object({ note: z.string().max(2000).optional() });
const sendSchema = z.object({
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
});

/** GET /invoices */
async function list(req, res) {
  const raw = req.validatedQuery || req.query;
  const q = parseListQuery(raw, { sortable: SORTABLE, includable: INCLUDABLE });
  const where = { ...q.where, deletedAt: null };
  const filters = { ...q.filtersApplied };

  if (raw.status) {
    const arr = Array.isArray(raw.status) ? raw.status : String(raw.status).split(',');
    where.status = { in: arr };
    filters.status = arr;
  }
  if (raw.client_id) {
    where.clientId = Number(raw.client_id);
    filters.client_id = Number(raw.client_id);
  }
  if (raw.is_rcm !== undefined) {
    where.isRcm = raw.is_rcm === 'true' || raw.is_rcm === true;
    filters.is_rcm = where.isRcm;
  }
  if (raw.billing_month) {
    where.billingMonth = String(raw.billing_month);
    filters.billing_month = raw.billing_month;
  }
  if (raw.overdue === 'true' || raw.overdue === true) {
    where.dueDate = { lt: new Date() };
    where.status = { notIn: ['paid', 'cancelled'] };
    filters.overdue = true;
  }

  const [total, items] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({ where, orderBy: q.orderBy, skip: q.skip, take: q.take, include: q.include }),
  ]);
  return ok(res, items, { meta: buildMeta(total, q.page, q.limit), filters_applied: filters });
}

/** GET /invoices/:id */
async function getOne(req, res) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: Number(req.params.id), deletedAt: null },
    include: { client: true, trip: true, creator: { select: { id: true, name: true } } },
  });
  if (!invoice) throw AppError.notFound('Invoice not found');
  return ok(res, invoice);
}

/** POST /invoices — server computes all GST/RCM + invoice number */
async function create(req, res) {
  const invoice = await gstService.createInvoice(req.body, req.user.userId);
  await auditLog(req, 'invoice.created', 'invoices', invoice.id, null, invoice, invoice.invoiceNumber);
  return ok(res, invoice, { status: 201 });
}

/** PATCH /invoices/:id/approve */
async function approve(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.invoice.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Invoice not found');
  if (before.status === 'cancelled') throw AppError.conflict('Cannot approve a cancelled invoice');

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: 'approved', approvedBy: req.user.userId },
  });
  await auditLog(req, 'invoice.approved', 'invoices', id, before, invoice, invoice.invoiceNumber);
  return ok(res, invoice);
}

/** PATCH /invoices/:id/mark-paid */
async function markPaid(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.invoice.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Invoice not found');

  const b = req.body;
  const newPaid = Number(before.paidAmount) + Number(b.paid_amount);
  const fullyPaid = newPaid >= Number(before.totalAmount);

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: newPaid,
      paidAt: b.paid_at || new Date(),
      paymentRef: b.payment_ref || before.paymentRef,
      status: fullyPaid ? 'paid' : before.status,
    },
  });
  await auditLog(req, 'invoice.paid', 'invoices', id, before, invoice, invoice.invoiceNumber);
  return ok(res, invoice);
}

/** GET /invoices/:id/pdf */
async function pdf(req, res, next) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
      include: { client: true, trip: true },
    });
    if (!invoice) throw AppError.notFound('Invoice not found');
    const buffer = await generateInvoicePdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

/** POST /invoices/:id/send */
async function send(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.invoice.findFirst({
    where: { id, deletedAt: null },
    include: { client: true },
  });
  if (!before) throw AppError.notFound('Invoice not found');

  // Delivery integration (email/WhatsApp) is out of scope for the API stub;
  // we record intent + flip status to sent.
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: before.status === 'paid' ? before.status : 'sent' },
  });
  await auditLog(
    req,
    'invoice.sent',
    'invoices',
    id,
    before,
    { ...invoice, sentTo: req.body },
    invoice.invoiceNumber
  );
  return ok(res, { ...invoice, dispatched: { email: req.body.email || null, whatsapp: req.body.whatsapp || null } });
}

/** DELETE /invoices/:id (soft delete -> cancelled) */
async function remove(req, res) {
  const id = Number(req.params.id);
  const before = await prisma.invoice.findFirst({ where: { id, deletedAt: null } });
  if (!before) throw AppError.notFound('Invoice not found');
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: 'cancelled', deletedAt: new Date() },
  });
  await auditLog(req, 'invoice.cancelled', 'invoices', id, before, invoice, before.invoiceNumber);
  return ok(res, { id, cancelled: true });
}

module.exports = {
  schemas: { createSchema, markPaidSchema, approveSchema, sendSchema },
  list,
  getOne,
  create,
  approve,
  markPaid,
  pdf,
  send,
  remove,
};
