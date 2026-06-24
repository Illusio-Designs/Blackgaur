import { amountInWords } from '@/lib/gst';
import { htmlDocToPdf } from '@/lib/pdf';

function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Directly downloads a GST tax invoice as an A4-portrait .pdf file (no print
 * dialog). Mirrors a standard Indian GST tax invoice layout for a Goods
 * Transport Agency.
 *
 * BUSINESS RULE: GTA invoices never show or deduct TDS (the recipient deducts it).
 * Total = taxable amount + GST. GST is NIL when reverse charge (RCM) applies.
 */
export async function downloadInvoicePdf(inv, branding = {}) {
  if (typeof window === 'undefined' || !inv) return;
  const c = branding.contact || {};
  const supplier = branding.legalName || branding.companyName || 'Company';
  const initial = (supplier.trim()[0] || 'C').toUpperCase();

  const freight = Number(inv.freight_amount || 0);
  const igst = Number(inv.igst_amount || 0);
  const cgst = Number(inv.cgst_amount || 0);
  const sgst = Number(inv.sgst_amount || 0);
  const gstTotal = igst + cgst + sgst;
  const subtotal = Number(inv.subtotal || 0);
  const total = Number(inv.total_amount != null ? inv.total_amount : subtotal + gstTotal);

  // Derive the displayed GST rate from the invoice figures.
  let rate;
  if (igst > 0 && freight > 0) rate = Math.round((igst / freight) * 100);
  else if (cgst > 0 && freight > 0) rate = Math.round(((cgst + sgst) / freight) * 100);
  else rate = 5;

  const taxLabel = inv.is_rcm ? 'RCM' : `${rate}%`;

  // Logo: image if provided, else a navy initial square.
  const logo = branding.logoUrl
    ? `<img src="${esc(branding.logoUrl)}" alt="logo" style="width:56px;height:56px;object-fit:contain;border:1px solid #cbd5e1;border-radius:6px;background:#fff;"/>`
    : `<div style="width:56px;height:56px;background:#0B1E3D;color:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;">${esc(initial)}</div>`;

  const placeOfSupply = inv.client?.state_code || inv.client?.billing_state || c.state || '—';

  // Build line items: the freight line plus any extra charges present.
  const items = [
    {
      name: 'Road transport of goods (Freight)',
      hsn: '996511',
      qty: 1,
      rate: freight,
      per: 'trip',
      amount: freight,
    },
  ];
  const extras = [
    ['Loading charges', inv.loading_charges],
    ['Unloading charges', inv.unloading_charges],
    ['Detention charges', inv.detention_charges],
    ['Other charges', inv.other_charges],
  ];
  extras.forEach(([label, val]) => {
    const v = Number(val || 0);
    if (v > 0) items.push({ name: label, hsn: '996511', qty: 1, rate: v, per: 'trip', amount: v });
  });
  const qtyTotal = items.reduce((s, it) => s + it.qty, 0);

  const itemRows = items
    .map(
      (it, i) => `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${esc(it.name)}</td>
        <td style="text-align:center">${esc(it.hsn)}</td>
        <td style="text-align:center">${taxLabel}</td>
        <td style="text-align:center">${it.qty}</td>
        <td style="text-align:right">${inr(it.rate)}</td>
        <td style="text-align:center">${esc(it.per)}</td>
        <td style="text-align:right">${inr(it.amount)}</td>
      </tr>`
    )
    .join('');

  // Totals tax rows.
  let taxRows;
  if (inv.is_rcm) {
    taxRows = `<tr><td>IGST (RCM)</td><td class="amt">₹0.00</td></tr>`;
  } else if (igst > 0) {
    taxRows = `<tr><td>IGST ${rate}%</td><td class="amt">${inr(igst)}</td></tr>`;
  } else {
    const half = (rate / 2);
    taxRows = `<tr><td>CGST ${half}%</td><td class="amt">${inr(cgst)}</td></tr>
               <tr><td>SGST ${half}%</td><td class="amt">${inr(sgst)}</td></tr>`;
  }

  const hsnRate = inv.is_rcm ? 0 : rate;
  const hsnTax = inv.is_rcm ? 0 : gstTotal;

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <title>${esc(inv.invoice_number)}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
    body{color:#0f172a;font-size:10.5px;}
    .doc{border:1px solid #94a3b8;padding:12px;}
    .strip{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
    .strip .ttl{flex:1;text-align:center;font-size:16px;font-weight:700;color:#15803d;letter-spacing:.18em;}
    .strip .orig{border:1px solid #94a3b8;padding:4px 8px;font-size:10px;font-weight:700;color:#0B1E3D;}
    table{width:100%;border-collapse:collapse;}
    .bx{border:1px solid #94a3b8;}
    .bx td{border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top;}
    .muted{color:#64748b;}
    .lbl{color:#64748b;font-size:11px;}
    .head td{vertical-align:top;}
    .metagrid{width:100%;border-collapse:collapse;}
    .metagrid td{border:1px solid #cbd5e1;padding:4px 8px;font-size:10px;}
    .metagrid td.k{color:#64748b;width:42%;}
    .items{width:100%;border-collapse:collapse;margin-top:7px;}
    .items th,.items td{border:1px solid #cbd5e1;padding:4px 7px;font-size:10px;}
    .items th{background:#0B1E3D;color:#fff;text-align:center;font-size:11px;}
    .sec-h{color:#15803d;font-weight:700;font-size:10px;margin-bottom:4px;}
    .totbox{width:320px;border-collapse:collapse;margin-left:auto;}
    .totbox td{border:1px solid #cbd5e1;padding:4px 8px;}
    .totbox td.amt{text-align:right;font-variant-numeric:tabular-nums;}
    .totbox tr.grand td{font-weight:700;color:#0B1E3D;background:#f1f5f9;}
    .words{margin-top:7px;border:1px solid #cbd5e1;padding:5px 8px;font-size:10px;}
    .hsn{width:100%;border-collapse:collapse;margin-top:7px;}
    .hsn th,.hsn td{border:1px solid #cbd5e1;padding:4px 6px;font-size:11px;text-align:center;}
    .hsn th{background:#f1f5f9;color:#0B1E3D;}
    .hsn td.amt,.hsn th.amt{text-align:right;}
    .payblk{width:300px;border-collapse:collapse;margin-left:auto;margin-top:7px;}
    .payblk td{border:1px solid #cbd5e1;padding:4px 8px;}
    .payblk td.amt{text-align:right;font-variant-numeric:tabular-nums;}
    .payblk tr.grand td{font-weight:700;color:#0B1E3D;background:#f1f5f9;}
    .rcm{margin-top:7px;background:#FEF3C7;color:#92400E;border:1px solid #f59e0b;padding:6px 10px;font-weight:600;font-size:10px;}
    .bottom td{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;font-size:10px;}
    .sign-space{height:26px;}
    .notes td{border:1px solid #cbd5e1;padding:5px 8px;font-size:10px;vertical-align:top;}
    .ftr{margin-top:6px;text-align:center;color:#64748b;font-size:11px;}
    .amt{text-align:right;font-variant-numeric:tabular-nums;}
  </style></head><body>
  <div class="doc">
    <div class="strip">
      <div style="width:160px"></div>
      <div class="ttl">REFERENCE NOTE</div>
      <div style="width:160px;text-align:right"><span class="orig">FOR REFERENCE ONLY</span></div>
    </div>

    <table class="bx head">
      <tr>
        <td style="width:58%">
          <table style="border:0"><tr style="border:0">
            <td style="border:0;width:64px;padding:0 12px 0 0">${logo}</td>
            <td style="border:0;padding:0">
              <div style="font-size:16px;font-weight:700;color:#0B1E3D">${esc(supplier)}</div>
              <div class="muted" style="font-size:10px;margin-top:2px">GSTIN: ${esc(c.gstin || '—')}</div>
              <div class="muted" style="font-size:10px">${esc([c.addressLine, c.city, c.state].filter(Boolean).join(', ') || '—')}</div>
              <div class="muted" style="font-size:10px">Mobile: ${esc(c.phone || '—')}</div>
              <div class="muted" style="font-size:10px">Email: ${esc(c.email || '—')}</div>
            </td>
          </tr></table>
        </td>
        <td style="width:42%">
          <table class="metagrid">
            <tr><td class="k">Reference #:</td><td>${esc(inv.invoice_number || '—')}</td></tr>
            <tr><td class="k">Date:</td><td>${esc(inv.due_date || '—')}</td></tr>
            <tr><td class="k">Place of Supply:</td><td>${esc(placeOfSupply)}</td></tr>
            <tr><td class="k">Due Date:</td><td>Immediate on Receipt</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="bx" style="margin-top:14px">
      <tr>
        <td style="width:50%">
          <div class="sec-h">Customer Details:</div>
          <div style="font-weight:600;color:#0B1E3D">${esc(inv.client?.company_name || '—')}</div>
          <div class="muted">GSTIN: ${esc(inv.client?.gstin || '—')}</div>
          <div class="muted">Billing address: ${esc(inv.client?.billing_address || '—')}</div>
          <div class="muted">Ph: ${esc(inv.client?.contact_mobile || '—')}</div>
          <div class="muted">Email: ${esc(inv.client?.email || '—')}</div>
        </td>
        <td style="width:50%">
          <div class="sec-h">Shipping address:</div>
          <div>${esc(inv.client?.company_name || '—')}</div>
          <div class="muted">${esc(inv.client?.billing_address || '—')}</div>
        </td>
      </tr>
    </table>

    <table class="items">
      <thead><tr>
        <th style="width:4%">#</th>
        <th style="width:30%">Item</th>
        <th style="width:11%">HSN/SAC</th>
        <th style="width:8%">Tax</th>
        <th style="width:7%">Qty</th>
        <th style="width:13%">Rate/Item</th>
        <th style="width:8%">Per</th>
        <th style="width:13%">Amount</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table class="totbox">
      <tr><td>Taxable Amount</td><td class="amt">${inr(subtotal)}</td></tr>
      ${taxRows}
      <tr class="grand"><td>Total (Qty ${qtyTotal})</td><td class="amt">${inr(total)}</td></tr>
    </table>

    <div class="words">Amount Chargeable (in words): INR ${esc(amountInWords(Math.round(total)))}. E &amp; O.E</div>

    ${inv.is_rcm ? '<div class="rcm">Tax payable under Reverse Charge (Sec 9(3) CGST Act) — payable by recipient.</div>' : ''}

    <table class="hsn">
      <thead>
        <tr>
          <th rowspan="2">HSN/SAC</th>
          <th rowspan="2">Taxable Value</th>
          <th colspan="2">Integrated Tax</th>
          <th rowspan="2">Total Tax Amount</th>
        </tr>
        <tr><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>996511</td>
          <td class="amt">${inr(subtotal)}</td>
          <td>${hsnRate}%</td>
          <td class="amt">${inr(hsnTax)}</td>
          <td class="amt">${inr(hsnTax)}</td>
        </tr>
        <tr style="font-weight:700;background:#f1f5f9">
          <td>TOTAL</td>
          <td class="amt">${inr(subtotal)}</td>
          <td></td>
          <td class="amt">${inr(hsnTax)}</td>
          <td class="amt">${inr(hsnTax)}</td>
        </tr>
      </tbody>
    </table>

    <table class="payblk">
      <tr><td>Amount Payable</td><td class="amt">${inr(total)}</td></tr>
      <tr><td>Previous dues</td><td class="amt">₹0.00</td></tr>
      <tr><td>Current due</td><td class="amt">${inr(total)}</td></tr>
      <tr class="grand"><td>Total Amount due</td><td class="amt">${inr(total)}</td></tr>
    </table>

    <table class="bx bottom" style="margin-top:14px">
      <tr>
        <td style="width:50%">
          <div class="sec-h">Bank Details:</div>
          <div>Bank: ${esc(c.bankName || 'State Bank of India')}</div>
          <div>Account #: ${esc(c.bankAccount || '—')}</div>
          <div>IFSC: ${esc(c.ifsc || '—')}</div>
          <div>Branch: ${esc(c.branch || '—')}</div>
        </td>
        <td style="width:50%">
          <div style="font-weight:600;color:#0B1E3D">For ${esc(supplier)}</div>
          <div class="sign-space"></div>
          <div style="border-top:1px solid #94a3b8;padding-top:6px;text-align:center">Authorised Signatory</div>
        </td>
      </tr>
    </table>

    <table class="bx notes" style="margin-top:14px">
      <tr>
        <td style="width:50%"><div class="sec-h">Notes:</div>Thank you for choosing us!</td>
        <td style="width:50%"><div class="sec-h">Terms and Conditions:</div>T&amp;C Apply</td>
      </tr>
    </table>

    <div class="ftr">${esc(branding.tagline || 'Goods Transport Agency')} &nbsp;·&nbsp; Page 1/1 &nbsp;·&nbsp; This is a computer-generated reference note, not a tax invoice.</div>
  </div>
  </body></html>`;

  await htmlDocToPdf(html, `${inv.invoice_number || 'invoice'}.pdf`, { orientation: 'portrait' });
}
