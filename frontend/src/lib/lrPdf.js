function inr(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dateOnly(d) {
  return String(d || '').slice(0, 10) || '—';
}

/**
 * Opens a print-ready Lorry Receipt / consignment note (Bilty) in a new window
 * and triggers the browser print dialog (Save as PDF). Dense A4 landscape layout
 * mirroring a transporter LR.
 */
export function downloadLrPdf(trip, branding = {}) {
  if (typeof window === 'undefined' || !trip) return;
  const c = branding.contact || {};
  const company = branding.companyName || 'Transporter';
  const initial = (company.trim()[0] || 'T').toUpperCase();
  const freight = Number(trip.freight_charges || 0);
  const weight = trip.cargo_weight_kg != null ? trip.cargo_weight_kg : '—';

  const logo = branding.logoUrl
    ? `<img src="${esc(branding.logoUrl)}" alt="logo" style="width:48px;height:48px;object-fit:contain;border:1px solid #cbd5e1;background:#fff;"/>`
    : `<div style="width:48px;height:48px;background:#0B1E3D;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">${esc(initial)}</div>`;

  const lrDate = dateOnly(trip.planned_departure || trip.created_at);
  const ewayExpiry = dateOnly(trip.eway_bill_expiry);
  const genOn = dateOnly(trip.created_at || trip.planned_departure);

  const win = window.open('', '_blank', 'width=1180,height=860');
  if (!win) return;

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
  <title>${esc(trip.lr_number)}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
    body{color:#0f172a;font-size:11px;}
    .doc{border:1px solid #94a3b8;}
    table{width:100%;border-collapse:collapse;}
    .hdr td{padding:6px 8px;vertical-align:middle;border-bottom:1px solid #94a3b8;}
    .cname{text-align:center;font-size:20px;font-weight:700;text-transform:uppercase;color:#0B1E3D;letter-spacing:.04em;}
    .subline{text-align:center;color:#64748b;font-size:10.5px;margin-top:2px;}
    .badge{border:1px solid #0B1E3D;color:#0B1E3D;font-weight:700;font-size:10px;padding:4px 8px;display:inline-block;}
    .hl{background:#FEF3C7;color:#92400E;padding:1px 5px;font-weight:600;}
    .band td{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;}
    .sec{color:#15803d;font-weight:700;font-size:10.5px;margin-bottom:3px;}
    .muted{color:#64748b;}
    .notice{font-size:9.5px;color:#475569;line-height:1.35;}
    .risk{font-weight:700;color:#0B1E3D;font-size:12px;}
    .meta{width:100%;border-collapse:collapse;}
    .meta td{border:1px solid #cbd5e1;padding:2px 6px;font-size:10px;}
    .meta td.k{color:#64748b;width:46%;}
    .items{width:100%;border-collapse:collapse;}
    .items th,.items td{border:1px solid #cbd5e1;padding:5px 6px;font-size:10px;}
    .items th{background:#0B1E3D;color:#fff;text-align:center;font-size:9.5px;}
    .items td.c{text-align:center;}
    .charges{width:100%;border-collapse:collapse;}
    .charges td{border:1px solid #cbd5e1;padding:4px 8px;font-size:10px;}
    .charges td.amt{text-align:right;font-variant-numeric:tabular-nums;width:38%;}
    .charges tr.b td{font-weight:700;color:#0B1E3D;background:#f1f5f9;}
    .sign-space{height:34px;}
    .bottom td{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;font-size:10px;}
    .ftr td{border:1px solid #cbd5e1;padding:6px 8px;font-size:10px;}
  </style></head><body>
  <div class="doc">
    <!-- 1. Header band -->
    <table class="hdr">
      <tr>
        <td style="width:80px">${logo}</td>
        <td>
          <div class="cname">${esc(company)}</div>
          <div class="subline">${esc([c.addressLine, c.city, c.state].filter(Boolean).join(', ') || '—')} &nbsp; <span class="hl">Branch Code : 172</span> &nbsp; Ph: ${esc(c.phone || '—')} &nbsp; Email: ${esc(c.email || '—')}</div>
        </td>
        <td style="width:150px;text-align:right"><span class="badge">TRANSPORTER COPY</span></td>
      </tr>
    </table>

    <!-- 2. Notice / Risk / Meta -->
    <table class="band">
      <tr>
        <td style="width:40%">
          <div class="sec">Notice</div>
          <div class="notice">Without the consignee's written permission this consignment will not be diverted, re-routed, or rebooked and it should be delivered at the destination. Lorry Receipt will be delivered to the only consignee. Without prior approval, Lorry Receipt cannot be handed over to anyone.</div>
        </td>
        <td style="width:25%">
          <div class="risk">AT OWNER'S RISK</div>
          <div style="margin-top:6px">GST No.: ${esc(c.gstin || '—')}</div>
          <div>PAN No.: ${esc(c.pan || '—')}</div>
        </td>
        <td style="width:35%">
          <table class="meta">
            <tr><td class="k">LR Date:</td><td>${esc(lrDate)}</td></tr>
            <tr><td class="k">LR No.:</td><td>${esc(trip.lr_number || '—')}</td></tr>
            <tr><td class="k">Truck/Vehicle No.:</td><td>${esc(trip.vehicle?.registration_no || '—')}</td></tr>
            <tr><td class="k">Transport Mode:</td><td>By Truck</td></tr>
            <tr><td class="k">From:</td><td>${esc(trip.origin_city || '—')}</td></tr>
            <tr><td class="k">To:</td><td>${esc(trip.destination_city || '—')}</td></tr>
            <tr><td class="k">Driver:</td><td>${esc(trip.driver?.name || '—')}</td></tr>
            <tr><td class="k">Delivery Type:</td><td>Door</td></tr>
            <tr><td class="k">Payment Status:</td><td>Paid</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 3. Consignor / Consignee / Insurance -->
    <table class="band">
      <tr>
        <td style="width:38%">
          <div class="sec">Consignor:</div>
          <div style="font-weight:600;color:#0B1E3D">${esc(trip.client?.company_name || '—')}</div>
          <div>GST No.: ${esc(trip.client?.gstin || '—')}</div>
          <div>Mobile: ${esc(trip.client?.contact_mobile || '—')}</div>
          <div class="muted">Address: ${esc(trip.client?.billing_address || '—')}</div>
          <div>E-Way Bill: ${esc(trip.eway_bill_no || '—')} (Expiry: ${esc(ewayExpiry)})</div>
          <div class="muted">Generated on: ${esc(genOn)}</div>
          <div class="muted">Invoice: ${esc(trip.lr_number || '—')} (${esc(lrDate)})</div>
        </td>
        <td style="width:38%">
          <div class="sec">Consignee:</div>
          <div style="font-weight:600;color:#0B1E3D">Consignee at ${esc(trip.destination_city || '—')}</div>
          <div>GST No.: —</div>
          <div>Mobile: —</div>
          <div class="muted">Address: ${esc(trip.destination_address || '—')}</div>
        </td>
        <td style="width:24%">
          <div class="sec">Insurance details:</div>
          <div class="muted">Insurance details is not available or not insured.</div>
        </td>
      </tr>
    </table>

    <!-- 4. Items (left) + Charges (right) -->
    <table class="band">
      <tr>
        <td style="width:62%;padding:0">
          <table class="items">
            <thead><tr>
              <th style="width:6%">Sr no.</th>
              <th>Product / Material</th>
              <th>Packaging Type (LxBxH)</th>
              <th>HSN Code</th>
              <th>Articles Packages</th>
              <th>Actual Weight</th>
              <th>Charge Weight</th>
              <th>Freight Rate</th>
            </tr></thead>
            <tbody>
              <tr>
                <td class="c">1</td>
                <td>${esc(trip.cargo_type || '—')}</td>
                <td class="c">BAGS</td>
                <td class="c">3901</td>
                <td class="c">200</td>
                <td class="c">${esc(weight)} KG</td>
                <td class="c">${esc(weight)} KG</td>
                <td class="c">₹ 4.0/KG</td>
              </tr>
              <tr>
                <td colspan="8" style="font-weight:600;color:#0B1E3D">WEIGHT GUARANTEE: ${esc(weight)} KG</td>
              </tr>
              <tr style="font-weight:700;background:#f1f5f9">
                <td colspan="4">Total packages: 200</td>
                <td colspan="4">Total weights: ${esc(weight)} KG</td>
              </tr>
              <tr>
                <td colspan="8" style="height:34px;vertical-align:top">Other Remark:</td>
              </tr>
            </tbody>
          </table>
        </td>
        <td style="width:38%;padding:0">
          <table class="charges">
            <tr><td>Total Basic Freight</td><td class="amt">${inr(freight)}</td></tr>
            <tr><td>Packing &amp; Unloading Charge</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>Pickup Charges &amp; Door Delivery Charges</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>Service Charge</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>Loading Charges &amp; Unloading Charge</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>Cash On Delivery (COD) &amp; Delivery On Date (DOD)</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>Other Charges</td><td class="amt">${inr(0)}</td></tr>
            <tr class="b"><td>Subtotal</td><td class="amt">${inr(freight)}</td></tr>
            <tr><td>GST TAX (SGST 0.0%)</td><td class="amt">${inr(0)}</td></tr>
            <tr><td>GST TAX (CGST 0.0%)</td><td class="amt">${inr(0)}</td></tr>
            <tr class="b"><td>Total Freight</td><td class="amt">${inr(freight)}</td></tr>
            <tr><td>Advance Paid</td><td class="amt">${inr(0)}</td></tr>
            <tr class="b"><td>Remaining Payable Amount</td><td class="amt">${inr(freight)}</td></tr>
            <tr><td colspan="2" style="font-size:9.5px;color:#475569">GST Payable by: Consignee</td></tr>
            <tr><td colspan="2" style="font-size:9.5px;color:#475569">Remaining Amount to be paid by: Consignor</td></tr>
            <tr><td colspan="2" style="font-weight:600;color:#0B1E3D">For ${esc(company)}</td></tr>
            <tr><td colspan="2" class="sign-space"></td></tr>
            <tr><td colspan="2" style="text-align:right;border-top:1px solid #94a3b8">Authorized Signatory</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 5. Bottom band -->
    <table class="band bottom">
      <tr>
        <td style="width:33%">
          <div>Bank Name: ${esc(c.bankName || '—')}</div>
          <div>Bank A/C No.: ${esc(c.bankAccount || '—')}</div>
          <div>IFSC: ${esc(c.ifsc || '—')}</div>
        </td>
        <td style="width:34%;text-align:center">
          <div>Total amount of goods as per the invoice</div>
          <div class="muted" style="margin-top:4px">This is a computer generated LR / Bilty.</div>
        </td>
        <td style="width:33%">
          <div style="font-weight:600;color:#0B1E3D">Schedule of demurrage charges</div>
          <div>Demurrage charges applicable from reporting time after: 1 hour</div>
          <div>Applicable charge: ₹ 0 Per Hour</div>
        </td>
      </tr>
    </table>

    <!-- 6. Footer -->
    <table class="ftr">
      <tr>
        <td style="width:50%">Service Area:</td>
        <td style="width:50%">Receiver's Comments:</td>
      </tr>
    </table>
  </div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 350);
}
