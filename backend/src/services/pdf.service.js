'use strict';

const env = require('../config/env');
const AppError = require('../lib/AppError');

/**
 * Render an invoice PDF with all mandatory GTA fields (TMS Architecture §8.5).
 * Uses PDFKit, lazily required so the API boots even if pdfkit is not installed.
 *
 * @param {object} invoice prisma invoice with { client, trip } included
 * @returns {Promise<Buffer>}
 */
async function generateInvoicePdf(invoice) {
  let PDFDocument;
  try {
    // eslint-disable-next-line global-require
    PDFDocument = require('pdfkit');
  } catch (_e) {
    throw new AppError(501, 'PDF_UNAVAILABLE', 'PDF generation is not available (pdfkit not installed)');
  }

  const client = invoice.client || {};
  const trip = invoice.trip || null;
  const rcm = invoice.isRcm;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const money = (v) => `Rs. ${Number(v || 0).toFixed(2)}`;

    // ── Supplier header ──
    doc.fontSize(18).text(env.COMPANY_NAME, { continued: false });
    doc.fontSize(9).fillColor('#444');
    if (env.COMPANY_ADDRESS) doc.text(env.COMPANY_ADDRESS);
    doc.text(`GSTIN: ${env.COMPANY_GSTIN || '-'}    PAN: ${env.COMPANY_PAN || '-'}    State Code: ${env.COMPANY_STATE_CODE}`);
    doc.moveDown(0.5).fillColor('#000');

    doc.fontSize(14).text('TAX INVOICE', { align: 'center' });
    doc.moveDown(0.5);

    // ── Invoice meta ──
    doc.fontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Date: ${fmtDate(invoice.createdAt)}`);
    doc.text(`Whether tax is payable on Reverse Charge: ${rcm ? 'Yes' : 'No'}`);
    doc.moveDown(0.5);

    // ── Bill to ──
    doc.fontSize(11).text('Bill To:', { underline: true });
    doc.fontSize(10);
    doc.text(client.companyName || '-');
    if (client.billingAddress) doc.text(client.billingAddress);
    doc.text(`GSTIN: ${client.gstin || '-'}    State Code: ${client.stateCode || '-'}`);
    doc.text(`Place of Supply: ${client.stateCode || '-'}`);
    doc.moveDown(0.5);

    // ── Service description ──
    if (trip) {
      doc.text(
        `Service: Road transport of goods from ${trip.originCity} to ${trip.destinationCity}`
      );
      doc.text(`LR Number: ${trip.lrNumber || '-'}`);
      if (trip.ewayBillNo) doc.text(`E-way Bill: ${trip.ewayBillNo}`);
    } else if (invoice.billingMonth) {
      doc.text(`Service: Consolidated road transport — billing month ${invoice.billingMonth}`);
    }
    doc.moveDown(0.5);

    // ── Charges ──
    doc.fontSize(11).text('Charges', { underline: true });
    doc.fontSize(10);
    line(doc, 'Freight', money(invoice.freightAmount));
    line(doc, 'Loading', money(invoice.loadingCharges));
    line(doc, 'Unloading', money(invoice.unloadingCharges));
    line(doc, 'Detention', money(invoice.detentionCharges));
    line(doc, 'Other', money(invoice.otherCharges));
    line(doc, 'Subtotal', money(invoice.subtotal));

    // ── GST ──
    if (rcm) {
      doc.moveDown(0.3).fillColor('#9A3412');
      doc.text('Tax payable under Reverse Charge (RCM) — no GST charged on this invoice.');
      doc.fillColor('#000');
    } else {
      line(doc, `IGST (${num(invoice.igstRate)}%)`, money(invoice.igstAmount));
      line(doc, `CGST (${num(invoice.cgstRate)}%)`, money(invoice.cgstAmount));
      line(doc, `SGST (${num(invoice.sgstRate)}%)`, money(invoice.sgstAmount));
    }

    if (num(invoice.tdsAmount) > 0) {
      line(doc, `Less: TDS u/s 194C (${num(invoice.tdsRate)}%)`, `- ${money(invoice.tdsAmount)}`);
    }

    doc.moveDown(0.3).fontSize(12);
    line(doc, 'TOTAL PAYABLE', money(invoice.totalAmount));
    doc.fontSize(10).text(`Amount in words: ${inWords(invoice.totalAmount)}`);
    doc.moveDown(0.5);

    // ── Bank + signatory ──
    doc.fontSize(9).fillColor('#444');
    doc.text(
      `Bank: ${env.COMPANY_BANK_NAME || '-'}   A/c: ${env.COMPANY_BANK_ACCOUNT || '-'}   IFSC: ${env.COMPANY_BANK_IFSC || '-'}`
    );
    doc.moveDown(1.5).fillColor('#000');
    doc.text(`For ${env.COMPANY_NAME}`, { align: 'right' });
    doc.moveDown(1.5).text('Authorised Signatory', { align: 'right' });

    doc.end();
  });
}

function line(doc, label, value) {
  doc.text(`${label}: ${value}`);
}

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN');
}

function num(v) {
  return Number(v || 0);
}

/** Minimal integer-rupee to words (Indian system). */
function inWords(amount) {
  const n = Math.round(Number(amount || 0));
  if (n === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? ' ' + a[x % 10] : ''}`);
  const three = (x) => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ' ' + two(x % 100) : ''}` : two(x));
  let num2 = n;
  let out = '';
  const crore = Math.floor(num2 / 10000000);
  num2 %= 10000000;
  const lakh = Math.floor(num2 / 100000);
  num2 %= 100000;
  const thousand = Math.floor(num2 / 1000);
  num2 %= 1000;
  if (crore) out += `${three(crore)} Crore `;
  if (lakh) out += `${two(lakh)} Lakh `;
  if (thousand) out += `${two(thousand)} Thousand `;
  if (num2) out += three(num2);
  return `${out.trim()} Rupees Only`;
}

module.exports = { generateInvoicePdf };
