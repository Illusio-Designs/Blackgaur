'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Building2, Palette, Receipt, Plug, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import BrandingSection from '@/components/settings/BrandingSection';
import CompanySection from '@/components/settings/CompanySection';
import TaxSection from '@/components/settings/TaxSection';
import IntegrationsSection from '@/components/settings/IntegrationsSection';
import AlertsSection from '@/components/settings/AlertsSection';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { key: 'company', icon: Building2, Component: CompanySection },
  { key: 'branding', icon: Palette, Component: BrandingSection },
  { key: 'tax', icon: Receipt, Component: TaxSection },
  { key: 'integrations', icon: Plug, Component: IntegrationsSection },
  { key: 'alerts', icon: Bell, Component: AlertsSection },
];

export default function SettingsPage() {
  const t = useTranslations('settingsPage');
  const [active, setActive] = useState('company');

  const ActiveComponent =
    SECTIONS.find((s) => s.key === active)?.Component || CompanySection;

  return (
    <div>
      <PageHeader title={t('hubTitle')} subtitle={t('hubSubtitle')} icon={Settings} />

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Section nav: horizontal pills on mobile, sticky vertical on md+ */}
        <nav
          aria-label={t('hubTitle')}
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:sticky md:top-20 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:px-0"
        >
          {SECTIONS.map(({ key, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={cn(
                  'relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition md:w-full',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-brand-muted hover:bg-brand-surface hover:text-brand-navy',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-section-indicator"
                    className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-blue md:block"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {t(`sections.${key}`)}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
