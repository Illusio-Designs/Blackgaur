'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { stagger, staggerItem } from '@/lib/animations';

const STEPS = ['one', 'two', 'three', 'four'];

export default function HowItWorks() {
  const t = useTranslations('marketing');

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
            {t('howTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-4 text-lg text-brand-muted"
          >
            {t('howSubtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="relative mt-16 grid gap-10 lg:grid-cols-4"
        >
          {/* connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-brand-border to-transparent lg:block" />

          {STEPS.map((step, i) => (
            <motion.div key={step} variants={staggerItem} className="relative text-center lg:text-left">
              <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy font-display text-lg font-bold text-white shadow-elevated">
                {i + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-brand-navy">
                {t(`step.${step}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {t(`step.${step}Desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
