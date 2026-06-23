import { htmlDocToPdf } from '@/lib/pdf';

function inr(n) {
  const v = Number(n || 0);
  return '₹' + Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build a client ledger (statement of account) from invoices, payments and TDS
 * journal entries. Invoices are debits; payments and TDS deducted are credits.
 */
export function buildClientLedger(client, { invoices = [], payments = [], tds = [] }) {
  const cid = client?.id;
  const name = client?.company_name;
  const match = (x) => x.client?.id === cid || x.client?.company_name === name;
  const rows = [];
  invoices.filter(match).forEach((i) =>
    rows.push({ date: i.due_date || i.created_at, particulars: `Invoice ${i.invoice_number}`, voucher: i.invoice_number, debit: Number(i.total_amount || 0), credit: 0 }),
  );
  payments.filter(match).forEach((p) =>
    rows.push({ date: p.date, particulars: `Payment received (${p.mode})`, voucher: p.reference, debit: 0, credit: Number(p.amount_received || 0) }),
  );
  tds.filter(match).forEach((j) =>
    rows.push({ date: j.date, particulars: `TDS deducted (${j.section})`, voucher: j.invoice_number, debit: 0, credit: Number(j.tds_amount || 0) }),
  );
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let bal = 0;
  rows.forEach((r) => { bal += r.debit - r.credit; r.balance = bal; });
  return rows;
}

/** Directly downloads a client ledger / statement of account as A4-portrait .pdf. */
export async function downloadLedgerPdf(client, rows = [], branding = {}) {
  if (typeof window === 'undefined' || !client) return;
  const c = branding.contact || {};
  const supplier = branding.legalName || branding.companyName || 'Company';
  const totDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totCredit = rows.reduce((s, r) => s + r.credit, 0);
  const closing = rows.length ? rows[rows.length - 1].balance : 0;

  const body = rows
    .map(
      (r) => `<tr>
      <td>${esc(String(r.date).slice(0, 10))}</td>
      <td>${esc(r.particulars)}</td>
      <td class="mono">${esc(r.voucher || '—')}</td>
      <td class="amt">${r.debit ? inr(r.debit) : '—'}</td>
      <td class="amt">${r.credit ? inr(r.credit) : '—'}</td>
      <td class="amt">${inr(r.balance)} ${r.balance >= 0 ? 'Dr' : 'Cr'}</td>
    </tr>`,
    )
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Ledger — ${esc(client.company_name)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
    body{color:#0f172a;font-size:12px;}
    .doc{border:1px solid #94a3b8;padding:16px;}
    .hd{display:flex;justify-content:space-between;border-bottom:2px solid #0B1E3D;padding-bottom:10px;}
    .brand{font-size:18px;font-weight:700;color:#0B1E3D;}
    .muted{color:#64748b;font-size:11px;}
    .title{text-align:center;font-size:15px;font-weight:700;color:#15803d;letter-spacing:.06em;margin:12px 0;}
    .party{display:flex;justify-content:space-between;border:1px solid #cbd5e1;padding:8px 10px;margin-bottom:10px;}
    table.l{width:100%;border-collapse:collapse;}
    table.l th,table.l td{border:1px solid #cbd5e1;padding:6px 8px;font-size:11px;}
    table.l th{background:#0B1E3D;color:#fff;text-align:left;font-size:10.5px;}
    .amt{text-align:right;font-variant-numeric:tabular-nums;}
    .mono{font-family:Consolas,monospace;}
    tr.tot td{font-weight:700;background:#f1f5f9;color:#0B1E3D;}
    .foot{margin-top:16px;display:flex;justify-content:space-between;color:#64748b;font-size:11px;}
  </style></head><body>
  <div class="doc">
    <div class="hd">
      <div><div class="brand">${esc(supplier)}</div><div class="muted">GSTIN: ${esc(c.gstin || '—')} · ${esc([c.city, c.state].filter(Boolean).join(', ') || '')}</div></div>
      <div style="text-align:right"><div style="font-weight:700;color:#0B1E3D">STATEMENT OF ACCOUNT</div><div class="muted">Generated: ${new Date().toISOString().slice(0, 10)}</div></div>
    </div>
    <div class="title">Client Ledger</div>
    <div class="party">
      <div><div class="muted">Party</div><div style="font-weight:600;color:#0B1E3D">${esc(client.company_name)}</div><div class="muted">GSTIN: ${esc(client.gstin || '—')}</div></div>
      <div style="text-align:right"><div class="muted">Closing balance</div><div style="font-weight:700;color:#0B1E3D">${inr(closing)} ${closing >= 0 ? 'Dr' : 'Cr'}</div></div>
    </div>
    <table class="l">
      <thead><tr><th style="width:14%">Date</th><th>Particulars</th><th style="width:18%">Voucher</th><th class="amt" style="width:14%">Debit</th><th class="amt" style="width:14%">Credit</th><th class="amt" style="width:16%">Balance</th></tr></thead>
      <tbody>
        ${body || '<tr><td colspan="6" style="text-align:center;color:#64748b">No transactions</td></tr>'}
        <tr class="tot"><td colspan="3">Total</td><td class="amt">${inr(totDebit)}</td><td class="amt">${inr(totCredit)}</td><td class="amt">${inr(closing)} ${closing >= 0 ? 'Dr' : 'Cr'}</td></tr>
      </tbody>
    </table>
    <div class="foot"><span>Dr = receivable from party · Cr = advance/credit</span><span>For ${esc(supplier)}</span></div>
  </div>
  </body></html>`;

  await htmlDocToPdf(html, `Ledger-${String(client.company_name || 'client').replace(/[^a-z0-9]+/gi, '-')}.pdf`, { orientation: 'portrait' });
}
