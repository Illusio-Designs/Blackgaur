'use client';

import { useBranding } from '@/hooks/useBranding';
import { cn } from '@/lib/utils';

// Text-only company name (for copyright lines etc).
export function BrandName({ legal = false }) {
  const { branding } = useBranding();
  return <>{(legal && branding.legalName) || branding.companyName}</>;
}

// Text-only tagline.
export function BrandTagline() {
  const { branding } = useBranding();
  return <>{branding.tagline}</>;
}

// Renders the buyer's logo (logoUrl / logoDarkUrl if set) or a wordmark built
// from companyName. Used by the public Navbar/Footer and the dashboard Sidebar
// so branding stays consistent everywhere (section 13.3).
export default function BrandLogo({ dark = false, showName = true, className, imgClassName }) {
  const { branding } = useBranding();
  const name = branding.companyName || 'Company';
  const logo = dark ? branding.logoDarkUrl || branding.logoUrl : branding.logoUrl;
  const monogram = name.trim().charAt(0).toUpperCase() || 'C';

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className={cn('h-9 w-auto max-h-12 object-contain', imgClassName)}
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-amber font-display text-lg font-extrabold text-white shadow-sm">
          {monogram}
        </span>
      )}
      {showName && !logo && (
        <span
          className={cn(
            'font-display text-xl font-bold tracking-tight',
            dark ? 'text-white' : 'text-brand-navy',
          )}
        >
          {name}
        </span>
      )}
    </span>
  );
}
