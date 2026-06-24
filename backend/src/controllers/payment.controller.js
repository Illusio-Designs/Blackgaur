'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { parseListQuery, buildMeta } = require('../lib/pagination');
const { auditLog } = require('../middleware/auditLogger');

// Payments and the TDS journal are derived views over the Invoice model
// (paidAmount / paidAt / paymentRef / tdsAmount). There is no separate Payment
// table, so recording a payment updates the underlying invoice.
// paymentRef stores "<mode>:<reference>" so mode + reference round-trip.

const TDS_SECTION = '194C'; // freight — Sec 194C

const recordSchema = z.object({
  invoice_id: z.coerce.number().int().positive(),
  date: z.coerce.date().optional(),
  mode: z.string().max(20).optional(),
  reference: z.string().max(60).optional(),
  tds_deducted: z.coerce.number().nonnegative().optional(),
});

function splitRef(ref) {
  if (!ref) return { mode: null, reference: null };
  const i = String(ref).indexOf(':');
  if (i === -1) return { mode: String(ref), reference: null };
  return { mode: String(ref).slice(0, i), reference: String(ref).slice(i + 1) };
}

function toPayment(inv) {
  const { mode, reference } = splitRef(inv.paymentRef);
  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    client: inv.client ? { id: inv.client.id, company_name: inv.client.companyName } : null,
    gross: Number(inv.totalAmount),
    tds_deducted: Number(inv.tdsAmount),
    amount_received: Number(inv.paidAmount),
    mode,
    reference,
    date: inv.paidAt,
  };
}

/** GET /payments — invoices that have been paid. */
async function list(req, res) {
  const q = parseListQuery(req.validatedQuery || req.query, {
    sortable: ['paidAt', 'totalAmount'],
    defaultSort: 'paidAt',
  });
  const where = { deletedAt: null, paidAt: { not: null } };
  const [total, items] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      skip: q.skip,
      take: q.take,
      include: { client: { select: { id: true, companyName: true } } },
    }),
  ]);
  return ok(res, items.map(toPayment), { meta: buildMeta(total, q.page, q.limit) });
}

/** GET /payments/tds-journal — invoices with TDS deducted by the client. */
async function tdsJournal(req, res) {
  const q = parseListQuery(req.validatedQuery || req.query, {
    sortable: ['paidAt'],
    defaultSort: 'paidAt',
  });
  const where = { deletedAt: null, tdsAmount: { gt: 0 } };
  const [total, items] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      skip: q.skip,
      take: q.take,
      include: { client: { select: { id: true, companyName: true } } },
    }),
  ]);
  const rows = items.map((inv) => ({
    id: inv.id,
    date: inv.paidAt || inv.updatedAt,
    invoice_number: inv.invoiceNumber,
    client: inv.client ? { id: inv.client.id, company_name: inv.client.companyName } : null,
    section: TDS_SECTION,
    tds_amount: Number(inv.tdsAmount),
    narration: `TDS receivable on ${inv.invoiceNumber} (${inv.client?.companyName || ''})`,
  }));
  return ok(res, rows, { meta: buildMeta(total, q.page, q.limit) });
}

/** POST /payments — record a payment received against an invoice. */
async function record(req, res) {
  const b = req.body;
  const invoice = await prisma.invoice.findFirst({
    where: { id: Number(b.invoice_id), deletedAt: null },
    include: { client: { select: { id: true, companyName: true } } },
  });
  if (!invoice) throw AppError.notFound('Invoice not found');

  const gross = Number(invoice.totalAmount);
  const tds = b.tds_deducted != null ? Number(b.tds_deducted) : Number(invoice.tdsAmount) || 0;
  const received = Math.max(0, gross - tds);
  const paidAt = b.date ? new Date(b.date) : new Date();
  const paymentRef = `${b.mode || 'NEFT'}:${b.reference || ''}`;

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paidAmount: received, tdsAmount: tds, paymentRef, paidAt, status: 'paid' },
    include: { client: { select: { id: true, companyName: true } } },
  });
  await auditLog(req, 'payment.recorded', 'invoices', invoice.id, invoice, updated, invoice.invoiceNumber);
  return ok(res, toPayment(updated), { status: 201 });
}

module.exports = { schemas: { recordSchema }, list, tdsJournal, record };
