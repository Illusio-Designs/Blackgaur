'use strict';

const dayjs = require('dayjs');

/**
 * Determine intra-state vs inter-state supply (TMS Architecture §8.3).
 * @param {string} companyStateCode
 * @param {string} clientStateCode
 * @returns {'intrastate'|'interstate'}
 */
function determineGSTType(companyStateCode, clientStateCode) {
  return String(companyStateCode) === String(clientStateCode) ? 'intrastate' : 'interstate';
}

/**
 * Calculate GST split (TMS Architecture §8.3).
 * RCM => all zero (recipient pays). Inter-state => IGST. Intra-state => CGST+SGST.
 * @param {number} subtotal
 * @param {number} rate total GST percentage (e.g. 5 or 12)
 * @param {'intrastate'|'interstate'} gstType
 * @param {boolean} isRCM
 */
function calculateGST(subtotal, rate, gstType, isRCM) {
  if (isRCM) return { igst: 0, cgst: 0, sgst: 0 };
  if (gstType === 'interstate') {
    return { igst: round2((subtotal * rate) / 100), cgst: 0, sgst: 0 };
  }
  return {
    igst: 0,
    cgst: round2((subtotal * rate) / 200),
    sgst: round2((subtotal * rate) / 200),
  };
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Full server-authoritative invoice calculation (TMS Architecture §8.4).
 * @param {object} input
 * @param {number} [input.freightAmount]
 * @param {number} [input.loadingCharges]
 * @param {number} [input.unloadingCharges]
 * @param {number} [input.detentionCharges]
 * @param {number} [input.otherCharges]
 * @param {boolean} input.isRcm
 * @param {string} input.companyStateCode
 * @param {string} input.clientStateCode
 * @param {number} [input.gstRate] total GST % (default 5 for GTA, ignored if RCM)
 * @param {number} [input.tdsRate] TDS % under Sec 194C (default 0)
 */
function computeInvoice(input) {
  const freight = num(input.freightAmount);
  const loading = num(input.loadingCharges);
  const unloading = num(input.unloadingCharges);
  const detention = num(input.detentionCharges);
  const other = num(input.otherCharges);

  const subtotal = round2(freight + loading + unloading + detention + other);

  const isRcm = Boolean(input.isRcm);
  const gstType = determineGSTType(input.companyStateCode, input.clientStateCode);
  const gstRate = isRcm ? 0 : num(input.gstRate, 5);

  const gst = calculateGST(subtotal, gstRate, gstType, isRcm);

  // Effective per-component rates for storage.
  const igstRate = isRcm ? 0 : gstType === 'interstate' ? gstRate : 0;
  const cgstRate = isRcm ? 0 : gstType === 'intrastate' ? gstRate / 2 : 0;
  const sgstRate = isRcm ? 0 : gstType === 'intrastate' ? gstRate / 2 : 0;

  const gstTotal = round2(gst.igst + gst.cgst + gst.sgst);

  const tdsRate = num(input.tdsRate, 0);
  // TDS under 194C is computed on the freight/contract value (subtotal), not on GST.
  const tdsAmount = round2((subtotal * tdsRate) / 100);

  const totalAmount = round2(subtotal + gstTotal - tdsAmount);

  return {
    subtotal,
    isRcm,
    gstType,
    igstRate,
    cgstRate,
    sgstRate,
    igstAmount: gst.igst,
    cgstAmount: gst.cgst,
    sgstAmount: gst.sgst,
    tdsRate,
    tdsAmount,
    totalAmount,
  };
}

/**
 * Derive Indian financial year string (Apr–Mar) from a date.
 * @param {Date|string} date
 * @returns {string} e.g. "2024-25"
 */
function financialYear(date) {
  const d = dayjs(date);
  const year = d.year();
  const month = d.month(); // 0-indexed; Apr = 3
  const startYear = month >= 3 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, '0')}`;
}

/**
 * Generate invoice number (TMS Architecture §8.6).
 * @param {string} fy financial year e.g. "2024-25"
 * @param {number} lastSeq previous max sequence for this FY (0 if none)
 */
function generateInvoiceNumber(fy, lastSeq) {
  const seq = String(Number(lastSeq || 0) + 1).padStart(4, '0');
  return `INV-${fy}-${seq}`;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

module.exports = {
  determineGSTType,
  calculateGST,
  computeInvoice,
  financialYear,
  generateInvoiceNumber,
  round2,
};
