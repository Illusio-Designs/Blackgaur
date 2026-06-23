// Color helpers for the dynamic CSS-variable theme system (section 13).
// Brand colors are stored as space-separated RGB channels so Tailwind can apply
// opacity utilities, e.g. rgb(var(--brand-blue) / <alpha-value>).

// '#0B1E3D' -> '11 30 61'
export function hexToRgbChannels(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// Normalise any incoming hex (with or without #) to a valid '#rrggbb', else fallback.
export function normalizeHex(hex, fallback = '#000000') {
  if (!hex || typeof hex !== 'string') return fallback;
  let h = hex.trim();
  if (!h.startsWith('#')) h = `#${h}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = `#${h
      .slice(1)
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toLowerCase() : fallback;
}
