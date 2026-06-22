// RCM / GST display helpers — mirrors section 8.3 server logic.
// NOTE: real calculation is server-side only (section 17.3). This is for UI preview.

import { formatINR } from './utils';

export const COMPANY_STATE_CODE = '24'; // Gujarat (demo company)

export function determineGSTType(companyStateCode, clientStateCode) {
  return companyStateCode === clientStateCode ? 'intrastate' : 'interstate';
}

export function calculateGST(subtotal, rate, gstType, isRCM) {
  if (isRCM) return { igst: 0, cgst: 0, sgst: 0 };
  if (gstType === 'interstate') {
    return { igst: (subtotal * rate) / 100, cgst: 0, sgst: 0 };
  }
  return { igst: 0, cgst: (subtotal * rate) / 200, sgst: (subtotal * rate) / 200 };
}

// Full invoice computation flow (section 8.4)
export function computeInvoice({
  freight_amount = 0,
  loading_charges = 0,
  unloading_charges = 0,
  detention_charges = 0,
  other_charges = 0,
  is_rcm = false,
  gst_rate = 5,
  tds_rate = 0,
  client_state_code = COMPANY_STATE_CODE,
}) {
  const subtotal =
    Number(freight_amount) +
    Number(loading_charges) +
    Number(unloading_charges) +
    Number(detention_charges) +
    Number(other_charges);

  const gstType = determineGSTType(COMPANY_STATE_CODE, client_state_code);
  const { igst, cgst, sgst } = calculateGST(subtotal, gst_rate, gstType, is_rcm);
  const gstTotal = igst + cgst + sgst;
  const tds_amount = (subtotal * Number(tds_rate)) / 100;
  const total_amount = subtotal + gstTotal - tds_amount;

  return {
    subtotal,
    gstType,
    igst_amount: igst,
    cgst_amount: cgst,
    sgst_amount: sgst,
    gstTotal,
    tds_amount,
    total_amount,
    is_rcm,
  };
}

export function rcmNoticeKey(isRcm) {
  return isRcm ? 'rcm_yes' : 'rcm_no';
}

export function formatGSTLine(label, amount) {
  return `${label}: ${formatINR(amount, { decimals: 2 })}`;
}

// "Total amount in words" (Indian numbering) for invoice display (section 8.5)
export function amountInWords(amount) {
  const num = Math.floor(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
  };
  const threeDigits = (n) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${h ? ones[h] + ' Hundred' + (r ? ' ' : '') : ''}${r ? twoDigits(r) : ''}`;
  };

  let result = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  if (crore) result += `${twoDigits(crore)} Crore `;
  if (lakh) result += `${twoDigits(lakh)} Lakh `;
  if (thousand) result += `${twoDigits(thousand)} Thousand `;
  if (rest) result += threeDigits(rest);

  return `${result.trim()} Rupees Only`;
}
