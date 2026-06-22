'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ServicesGrid from '@/components/marketing/ServicesGrid';
import { stagger, staggerItem } from '@/lib/animations';

const COMPARISON = [
  'Live trip tracking from pickup to POD',
  'Automatic FASTag toll reconciliation',
  'Fuel-card limits & mileage per vehicle',
  'GST + RCM compliant invoicing',
  'Trip-level P&L and utilisation reports',
  'Immutable audit trail of every action',
];

const ROLES = ['admin', 'trip_manager', 'finance_manager', 'account_manager', 'driver'];

export default function ServicesPage() {
  const t = useTranslations('marketing');
  const tr = useTranslations('roles');

  return (
    <div className="bg-white">
      <section className="bg-brand-navy px-4 pt-36 pb-20 text-center text-white">
        <div className="container-page">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {t('servicesTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
          >
            {t('servicesSubtitle')}
          </motion.p>
        </div>
      </section>

      <ServicesGrid />

      {/* comparison table */}
      <section className="py-20 sm:py-28">
        <div className="container-page max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-brand-navy">
            Manual ops vs Blackgaur
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="card mt-10 overflow-hidden"
          >
            <div className="grid grid-cols-[1fr_auto_auto] items-center border-b border-brand-border bg-brand-surface px-5 py-3 text-sm font-semibold text-brand-navy">
              <span>Capability</span>
              <span className="w-20 text-center text-brand-muted">Manual</span>
              <span className="w-20 text-center text-brand-blue">Blackgaur</span>
            </div>
            {COMPARISON.map((row) => (
              <div
                key={row}
                className="grid grid-cols-[1fr_auto_auto] items-center border-b border-brand-border px-5 py-3.5 text-sm last:border-0"
              >
                <span className="pr-4 text-brand-text">{row}</span>
                <span className="flex w-20 justify-center">
                  <X className="h-5 w-5 text-brand-danger/70" />
                </span>
                <span className="flex w-20 justify-center">
                  <Check className="h-5 w-5 text-brand-success" />
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* role cards */}
      <section className="bg-brand-surface py-20 sm:py-28">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-brand-navy">
            Built for every role
          </h2>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ROLES.map((role) => (
              <motion.div key={role} variants={staggerItem} className="card p-6">
                <span className="inline-flex rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {tr(role)}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-brand-muted">
                  {tr(`${role}_desc`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
