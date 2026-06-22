'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatINR } from '@/lib/utils';

const wordContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const word = {
  initial: { opacity: 0, y: 24, rotate: 2 },
  animate: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Hero() {
  const t = useTranslations('marketing');
  const words = t('heroTitle').split(' ');

  return (
    <section className="relative overflow-hidden bg-brand-navy pt-32 pb-24 text-white sm:pt-40 sm:pb-32">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-brand-amber/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-amber" />
            {t('trustedBy')}
          </motion.span>

          <motion.h1
            variants={wordContainer}
            initial="initial"
            animate="animate"
            className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {words.map((w, i) => (
              <motion.span key={`${w}-${i}`} variants={word} className="mr-[0.3em] inline-block">
                {w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/login">
              <Button variant="amber" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                {t('heroCta')}
              </Button>
            </Link>
            <Link href="/track">
              <Button
                size="lg"
                className="border border-white/25 bg-white/5 text-white hover:bg-white/10"
                icon={MapPin}
              >
                {t('heroSecondary')}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* floating dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-md"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl border border-white/10 bg-white p-5 text-brand-text shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-xs text-brand-muted">LR-2024-25-0004</p>
                  <p className="text-sm font-semibold text-brand-navy">Mumbai &rarr; Surat</p>
                </div>
              </div>
              <StatusBadge status="in_transit" size="sm" pulse />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-surface p-3">
                <p className="text-xs text-brand-muted">Freight</p>
                <p className="mt-1 font-mono text-base font-semibold text-brand-navy">
                  {formatINR(48500)}
                </p>
              </div>
              <div className="rounded-xl bg-brand-surface p-3">
                <p className="text-xs text-brand-muted">Toll spend</p>
                <p className="mt-1 font-mono text-base font-semibold text-brand-navy">
                  {formatINR(3240)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { label: 'Booked', done: true },
                { label: 'Loading', done: true },
                { label: 'In Transit', done: false, active: true },
                { label: 'Delivered', done: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span
                    className={
                      s.active
                        ? 'h-2.5 w-2.5 rounded-full bg-brand-blue ring-4 ring-brand-blue/20'
                        : s.done
                          ? 'h-2.5 w-2.5 rounded-full bg-brand-success'
                          : 'h-2.5 w-2.5 rounded-full bg-brand-border'
                    }
                  />
                  <span
                    className={
                      s.done || s.active
                        ? 'text-sm font-medium text-brand-navy'
                        : 'text-sm text-brand-muted'
                    }
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/10 bg-brand-amber px-4 py-3 text-white shadow-elevated sm:block"
          >
            <p className="text-xs opacity-90">FASTag synced</p>
            <p className="font-mono text-lg font-bold">99.9%</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
