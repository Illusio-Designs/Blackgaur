// Direct PDF download (no print dialog). Renders a full HTML document string
// into an off-screen iframe, rasterises the .doc element with html2canvas and
// places it onto a SINGLE A4 page (contain-fit) via jsPDF, then saves it.
// Client-only.

export async function htmlDocToPdf(fullHtml, filename = 'document.pdf', { orientation = 'portrait' } = {}) {
  if (typeof window === 'undefined') return;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1300px;height:1840px;border:0;background:#fff;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(fullHtml);
  doc.close();

  // Give fonts + remote images (QR) a moment to load.
  await new Promise((r) => setTimeout(r, 450));

  const target = doc.querySelector('.doc') || doc.body;
  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: target.scrollWidth || 1200,
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation, compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = orientation === 'landscape' ? 6 : 8;
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;

    // Contain-fit the rendered document within one page (preserve aspect ratio)
    // so the whole invoice / LR / ledger lands on a single A4 page.
    const aspect = canvas.width / canvas.height;
    let imgW = availW;
    let imgH = availW / aspect;
    if (imgH > availH) {
      imgH = availH;
      imgW = availH * aspect;
    }
    const x = (pageW - imgW) / 2;
    const y = margin; // top-aligned

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', x, y, imgW, imgH);
    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
