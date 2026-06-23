import './globals.css';
import { DEFAULT_BRANDING } from '@/lib/branding';
import { API_BASE_URL } from '@/lib/api';

// Reads branding for <title>/description/favicon where feasible, falling back to
// transporter defaults so the site is fully standalone (no backend required).
async function getBranding() {
  try {
    const res = await fetch(`${API_BASE_URL}/branding`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('branding unavailable');
    const json = await res.json();
    return { ...DEFAULT_BRANDING, ...(json?.data ?? json) };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export async function generateMetadata() {
  const b = await getBranding();
  const title = `${b.companyName} — ${b.tagline}`;
  const metadata = {
    title: { default: title, template: `%s · ${b.companyName}` },
    description: b.tagline,
    applicationName: b.companyName,
    openGraph: { title, description: b.tagline, siteName: b.companyName },
  };
  if (b.faviconUrl) {
    metadata.icons = { icon: b.faviconUrl, apple: b.faviconUrl };
  }
  return metadata;
}

export default function RootLayout({ children }) {
  return children;
}
