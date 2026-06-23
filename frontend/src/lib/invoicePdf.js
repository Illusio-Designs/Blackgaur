import { amountInWords } from '@/lib/gst';

function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Opens a print-ready GST/RCM invoice in a new window and triggers the browser
 * print dialog (Save as PDF). Mirrors the mandatory GTA invoice fields (§8.5).
 * In production this is replaced by GET /v1/invoices/:id/pdf (server Puppeteer).
 */
export function downloadInvoicePdf(inv, branding = {}) {
  if (typeof window === 'undefined' || !inv) return;
  const c = branding.contact || {};
  const supplier = branding.legalName || branding.companyName || 'Company';
  const gstTotal = (inv.igst_amount || 0) + (inv.cgst_amount || 0) + (inv.sgst_amount || 0);
  const win = window.open('', '_blank', 'width=860,height=1020');
  if (!win) return;

  const rows = [
    ['Freight charges', inv.freight_amount],
    inv.loading_charges ? ['Loading charges', inv.loading_charges] : null,
    inv.unloading_charges ? ['Unloading charges', inv.unloading_charges] : null,
    inv.detention_charges ? ['Detention charges', inv.detention_charges] : null,
    inv.other_charges ? ['Other charges', inv.other_charges] : null,
  ].filter(Boolean);

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
  <title>${inv.invoice_number}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
    body{padding:40px;color:#334155;font-size:13px;}
    .hd{display:flex;justify-content:space-between;border-bottom:2px solid #0B1E3D;padding-bottom:16px;}
    .brand{font-size:20px;font-weight:700;color:#0B1E3D;}
    .muted{color:#64748B;font-size:12px;}
    .title{text-align:center;font-size:16px;font-weight:700;color:#0B1E3D;margin:18px 0;letter-spacing:.04em;}
    .grid{display:flex;justify-content:space-between;gap:24px;margin-bottom:16px;}
    .box{flex:1;border:1px solid #E2E8F0;border-radius:8px;padding:12px;}
    .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:4px;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th,td{border:1px solid #E2E8F0;padding:8px 10px;text-align:left;}
    th{background:#F1F5F9;font-size:11px;text-transform:uppercase;color:#64748B;}
    td.amt,th.amt{text-align:right;font-variant-numeric:tabular-nums;}
    .tot{display:flex;justify-content:flex-end;margin-top:12px;}
    .tot table{width:300px;}
    .rcm{margin-top:14px;background:#FEF3C7;color:#92400E;padding:8px 12px;border-radius:8px;font-weight:600;}
    .words{margin-top:10px;font-style:italic;color:#0B1E3D;}
    .ft{display:flex;justify-content:space-between;margin-top:36px;}
    .sign{text-align:right;}
  </style></head><body>
    <div class="hd">
      <div>
        <div class="brand">${supplier}</div>
        <div class="muted">${c.addressLine || ''} ${c.city || ''} ${c.state || ''}</div>
        <div class="muted">GSTIN: ${c.gstin || '—'}${c.phone ? ' · ' + c.phone : ''}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;color:#0B1E3D">TAX INVOICE</div>
        <div class="muted">${inv.invoice_number}</div>
        <div class="muted">Date: ${inv.due_date || ''}</div>
      </div>
    </div>

    <div class="title">Goods Transport Agency — Tax Invoice</div>

    <div class="grid">
      <div class="box">
        <div class="lbl">Bill to</div>
        <div style="font-weight:600;color:#0B1E3D">${inv.client?.company_name || '—'}</div>
        <div class="muted">GSTIN: ${inv.client?.gstin || '—'}</div>
        <div class="muted">Place of supply: ${inv.client?.billing_address || inv.client?.state_code || '—'}</div>
      </div>
      <div class="box">
        <div class="lbl">Reverse charge</div>
        <div style="font-weight:600;color:${inv.is_rcm ? '#92400E' : '#065F46'}">Tax payable on Reverse Charge: ${inv.is_rcm ? 'YES' : 'NO'}</div>
        <div class="muted" style="margin-top:6px">Service: Road transport of goods</div>
      </div>
    </div>

    <table>
      <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
      <tbody>
        ${rows.map(([l, v]) => `<tr><td>${l}</td><td class="amt">${inr(v)}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="tot"><table>
      <tr><td>Subtotal</td><td class="amt">${inr(inv.subtotal)}</td></tr>
      <tr><td>IGST / CGST / SGST</td><td class="amt">${inv.is_rcm ? 'NIL (RCM)' : inr(gstTotal)}</td></tr>
      <tr><td>TDS (194C)</td><td class="amt">- ${inr(inv.tds_amount)}</td></tr>
      <tr style="font-weight:700;color:#0B1E3D"><td>Total payable</td><td class="amt">${inr(inv.total_amount)}</td></tr>
    </table></div>

    <div class="words">Amount in words: ${amountInWords(Math.round(inv.total_amount || 0))}</div>
    ${inv.is_rcm ? '<div class="rcm">Tax payable under Reverse Charge Mechanism (Section 9(3), CGST Act). GST to be paid by the recipient.</div>' : ''}

    <div class="ft">
      <div class="muted">
        <div style="font-weight:600;color:#0B1E3D">Bank details</div>
        <div>${c.bankName || 'HDFC Bank'} · A/c ${c.bankAccount || '—'} · IFSC ${c.ifsc || '—'}</div>
      </div>
      <div class="sign">
        <div style="height:48px"></div>
        <div style="border-top:1px solid #94A3B8;padding-top:6px">Authorised signatory</div>
        <div class="muted">For ${supplier}</div>
      </div>
    </div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 350);
}
