'use client';

import { useTranslations } from 'next-intl';
import { useBranding } from '@/hooks/useBranding';

export default function DashboardFooter() {
  const t = useTranslations('footer');
  const { branding } = useBranding();
  const company = branding.companyName || 'Company';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-brand-border bg-white px-4 py-3 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-1.5 text-xs text-brand-muted sm:flex-row">
        <span>© {year} {company}. {t('rights')}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
          {t('poweredBy')}
        </span>
      </div>
    </footer>
  );
}
