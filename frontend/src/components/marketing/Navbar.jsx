'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'track', href: '/track' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-brand-border bg-white/90 shadow-sm backdrop-blur'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label={t('home')}>
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text transition hover:bg-brand-surface hover:text-brand-navy"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher compact />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition hover:text-brand-blue"
          >
            {t('login')}
          </Link>
          <Link href="/quote">
            <Button variant="amber" size="md">
              {t('getQuote')}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-focus inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-brand-navy/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col bg-white p-6 shadow-elevated lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setOpen(false)}>
                  <BrandLogo />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-focus inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.key}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-brand-text transition hover:bg-brand-surface hover:text-brand-navy"
                  >
                    {t(l.key)}
                  </Link>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <LanguageSwitcher />
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/quote" onClick={() => setOpen(false)}>
                  <Button variant="amber" size="lg" className="w-full">
                    {t('getQuote')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
