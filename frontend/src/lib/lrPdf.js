function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

/**
 * Opens a print-ready Lorry Receipt (consignment note) in a new window and
 * triggers the browser print dialog (Save as PDF). Demo equivalent of a
 * server-generated LR PDF.
 */
export function downloadLrPdf(trip, branding = {}) {
  if (typeof window === 'undefined' || !trip) return;
  const c = branding.contact || {};
  const supplier = branding.legalName || branding.companyName || 'Transporter';
  const win = window.open('', '_blank', 'width=860,height=1020');
  if (!win) return;

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
  <title>${trip.lr_number}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
    body{padding:40px;color:#334155;font-size:13px;}
    .hd{display:flex;justify-content:space-between;border-bottom:2px solid #0B1E3D;padding-bottom:16px;}
    .brand{font-size:20px;font-weight:700;color:#0B1E3D;}
    .muted{color:#64748B;font-size:12px;}
    .title{text-align:center;font-size:16px;font-weight:700;color:#0B1E3D;margin:18px 0;letter-spacing:.04em;}
    .grid{display:flex;gap:16px;margin-bottom:14px;}
    .box{flex:1;border:1px solid #E2E8F0;border-radius:8px;padding:12px;}
    .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:4px;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th,td{border:1px solid #E2E8F0;padding:8px 10px;text-align:left;}
    th{background:#F1F5F9;font-size:11px;text-transform:uppercase;color:#64748B;}
    .row{display:flex;justify-content:space-between;margin-top:4px;}
    .tot{display:flex;justify-content:flex-end;margin-top:14px;font-weight:700;color:#0B1E3D;}
    .ft{display:flex;justify-content:space-between;margin-top:40px;}
    .sign{text-align:right;}
  </style></head><body>
    <div class="hd">
      <div>
        <div class="brand">${supplier}</div>
        <div class="muted">${c.addressLine || ''} ${c.city || ''} ${c.state || ''}</div>
        <div class="muted">GSTIN: ${c.gstin || '—'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;color:#0B1E3D">LORRY RECEIPT</div>
        <div class="muted">${trip.lr_number}</div>
        <div class="muted">Date: ${(trip.planned_departure || trip.created_at || '').slice(0, 10)}</div>
      </div>
    </div>

    <div class="title">Consignment Note (LR)</div>

    <div class="grid">
      <div class="box">
        <div class="lbl">Consignor / From</div>
        <div style="font-weight:600;color:#0B1E3D">${trip.origin_city}</div>
        <div class="muted">${trip.origin_address || ''}</div>
      </div>
      <div class="box">
        <div class="lbl">Consignee / To</div>
        <div style="font-weight:600;color:#0B1E3D">${trip.destination_city}</div>
        <div class="muted">${trip.destination_address || ''}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="lbl">Client</div>
        <div>${trip.client?.company_name || '—'}</div>
      </div>
      <div class="box">
        <div class="lbl">Vehicle</div>
        <div>${trip.vehicle?.registration_no || '—'} · ${trip.driver?.name || '—'}</div>
      </div>
    </div>

    <table>
      <thead><tr><th>Cargo</th><th>Weight</th><th>Value</th><th>E-way bill</th></tr></thead>
      <tbody>
        <tr>
          <td>${trip.cargo_type || '—'}</td>
          <td>${trip.cargo_weight_kg ? trip.cargo_weight_kg + ' kg' : '—'}</td>
          <td>${trip.cargo_value ? inr(trip.cargo_value) : '—'}</td>
          <td>${trip.eway_bill_no || '—'}</td>
        </tr>
      </tbody>
    </table>

    <div class="tot">Freight: ${inr(trip.freight_charges)}</div>

    <div class="ft">
      <div class="muted">Received the above goods in good condition.</div>
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
