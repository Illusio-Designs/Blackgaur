import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merge helper
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format an amount as Indian Rupees
export function formatINR(value, opts = {}) {
  const { decimals = 0, showSymbol = true } = opts;
  const num = Number(value);
  if (Number.isNaN(num)) return showSymbol ? '₹0' : '0';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
  return showSymbol ? `₹${formatted}` : formatted;
}

// Compact INR (e.g. ₹1.2L, ₹3.4Cr)
export function formatINRCompact(value) {
  const num = Number(value) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  if (opts.withTime) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hh}:${mm}`;
  }
  return `${day} ${month} ${year}`;
}

// Locale-aware "time ago". Reads <html lang> on the client so it follows the
// active next-intl locale without each caller having to pass it. Falls back to
// English on the server / when Intl.RelativeTimeFormat is unavailable.
export function timeAgo(value, locale) {
  if (!value) return '—';
  const d = new Date(value);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const lang = locale || (typeof document !== 'undefined' ? document.documentElement.lang : 'en') || 'en';

  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  } catch {
    rtf = null;
  }
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (rtf) {
    if (seconds < 60) return rtf.format(0, 'second'); // "now" / "अभी"
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    if (hours < 24) return rtf.format(-hours, 'hour');
    if (days < 30) return rtf.format(-days, 'day');
    return formatDate(d);
  }

  // Fallback (no Intl.RelativeTimeFormat)
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

// Mask sensitive strings (card numbers, tag ids) -> ****1234
export function mask(value, visible = 4) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= visible) return str;
  return `****${str.slice(-visible)}`;
}

export function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function pct(part, whole) {
  if (!whole) return 0;
  return clamp(Math.round((part / whole) * 100), 0, 100);
}
