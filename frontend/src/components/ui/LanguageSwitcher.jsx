'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeNames, localeShort } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ compact = false }) {
  const locale = useLocale();
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const change = (next) => {
    setOpen(false);
    if (next === locale) return;
    router.replace({ pathname, params }, { locale: next });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-focus inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-surface"
        aria-label={tc('changeLanguage')}
      >
        <Globe className="h-4 w-4 text-brand-muted" />
        {compact ? localeShort[locale] : localeNames[locale]}
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-brand-border bg-white py-1 shadow-elevated">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => change(l)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-brand-text transition hover:bg-brand-surface"
            >
              {localeNames[l]}
              {l === locale && <Check className="h-4 w-4 text-brand-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
