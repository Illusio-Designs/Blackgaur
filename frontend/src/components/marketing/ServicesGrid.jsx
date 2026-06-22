'use client';

import { motion } from 'framer-motion';
import { Truck, Radio, Fuel, FileText, BarChart3, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { stagger, staggerItem } from '@/lib/animations';

const FEATURES = [
  { key: 'trips', icon: Truck, tint: 'bg-brand-blue/10 text-brand-blue' },
  { key: 'fastag', icon: Radio, tint: 'bg-teal-50 text-brand-fastag' },
  { key: 'fuel', icon: Fuel, tint: 'bg-orange-50 text-brand-fuel' },
  { key: 'invoices', icon: FileText, tint: 'bg-emerald-50 text-brand-success' },
  { key: 'reports', icon: BarChart3, tint: 'bg-indigo-50 text-indigo-600' },
  { key: 'audit', icon: History, tint: 'bg-amber-50 text-brand-amber' },
];

export default function ServicesGrid() {
  const t = useTranslations('marketing');

  return (
    <section className="bg-brand-surface py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl"
          >
            {t('servicesTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-4 text-lg text-brand-muted"
          >
            {t('servicesSubtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.key}
                variants={staggerItem}
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="card group p-6 transition-shadow hover:shadow-elevated"
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.tint}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-brand-navy">
                  {t(`feature.${f.key}`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {t(`feature.${f.key}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
