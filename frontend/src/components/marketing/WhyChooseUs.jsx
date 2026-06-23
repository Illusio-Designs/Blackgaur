'use client';

import { motion } from 'framer-motion';
import { Satellite, Radio, FileCheck2, Network } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranding } from '@/hooks/useBranding';
import { stagger, staggerItem } from '@/lib/animations';

const ICONS = [Satellite, Radio, FileCheck2, Network];

export default function WhyChooseUs() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const why = branding.content.why || [];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl"
          >
            {t('whyTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-4 text-lg text-brand-muted"
          >
            {t('whySubtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {why.map((w, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div key={w.title} variants={staggerItem} className="card p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-brand-navy">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{w.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
