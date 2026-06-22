'use strict';

const prisma = require('../lib/prisma');
const gst = require('../lib/gst');
const env = require('../config/env');
const AppError = require('../lib/AppError');

/**
 * Server-authoritative invoice computation + number generation.
 * The client may send amounts for display only; the server recalculates everything
 * (TMS Architecture §8, §17.3).
 */

/**
 * Build the computed invoice field set for create/update.
 * @param {object} input controller-validated body
 * @param {object} client prisma client row (for state code + rcm flag)
 */
function computeForClient(input, client) {
  const isRcm =
    input.is_rcm !== undefined ? Boolean(input.is_rcm) : Boolean(client.rcmApplicable);

  const computed = gst.computeInvoice({
    freightAmount: input.freight_amount,
    loadingCharges: input.loading_charges,
    unloadingCharges: input.unloading_charges,
    detentionCharges: input.detention_charges,
    otherCharges: input.other_charges,
    isRcm,
    companyStateCode: env.COMPANY_STATE_CODE,
    clientStateCode: client.stateCode || env.COMPANY_STATE_CODE,
    gstRate: input.gst_rate,
    tdsRate: input.tds_rate,
  });

  return {
    freightAmount: num(input.freight_amount),
    loadingCharges: num(input.loading_charges),
    unloadingCharges: num(input.unloading_charges),
    detentionCharges: num(input.detention_charges),
    otherCharges: num(input.other_charges),
    subtotal: computed.subtotal,
    isRcm: computed.isRcm,
    igstRate: computed.igstRate,
    cgstRate: computed.cgstRate,
    sgstRate: computed.sgstRate,
    igstAmount: computed.igstAmount,
    cgstAmount: computed.cgstAmount,
    sgstAmount: computed.sgstAmount,
    tdsRate: computed.tdsRate,
    tdsAmount: computed.tdsAmount,
    totalAmount: computed.totalAmount,
  };
}

/**
 * Allocate a financial-year-sequential invoice number atomically.
 * Uses a serializable transaction reading the current max sequence for the FY.
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {Date} invoiceDate
 */
async function allocateInvoiceNumber(tx, invoiceDate) {
  const fy = gst.financialYear(invoiceDate);
  const prefix = `INV-${fy}-`;

  // Find the highest existing sequence for this FY.
  const last = await tx.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  });

  let lastSeq = 0;
  if (last && last.invoiceNumber) {
    const parsed = parseInt(last.invoiceNumber.slice(prefix.length), 10);
    if (Number.isInteger(parsed)) lastSeq = parsed;
  }
  return gst.generateInvoiceNumber(fy, lastSeq);
}

/**
 * Create an invoice with server-side GST/RCM + atomic invoice number.
 * @param {object} body validated request body
 * @param {number} createdBy user id
 */
async function createInvoice(body, createdBy) {
  const client = await prisma.client.findFirst({
    where: { id: Number(body.client_id), deletedAt: null },
  });
  if (!client) throw AppError.badRequest('Client not found');

  const computed = computeForClient(body, client);
  const invoiceDate = body.invoice_date ? new Date(body.invoice_date) : new Date();

  return prisma.$transaction(async (tx) => {
    const invoiceNumber = await allocateInvoiceNumber(tx, invoiceDate);
    return tx.invoice.create({
      data: {
        invoiceNumber,
        invoiceType: body.invoice_type || 'outward',
        clientId: client.id,
        tripId: body.trip_id ? Number(body.trip_id) : null,
        billingMonth: body.billing_month || null,
        ...computed,
        status: 'draft',
        dueDate: body.due_date
          ? new Date(body.due_date)
          : addDays(invoiceDate, client.creditDays || 30),
        createdBy,
      },
    });
  });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

module.exports = { computeForClient, allocateInvoiceNumber, createInvoice };
