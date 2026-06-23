'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBranding } from '@/hooks/useBranding';
import { fadeUp } from '@/lib/animations';

export default function StatsStrip() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const stats = branding.content.stats || [];

  return (
    <section className="border-y border-brand-border bg-white py-16">
      <div className="container-page">
        <motion.p
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center text-sm font-medium uppercase tracking-wider text-brand-muted"
        >
          {t('statsHeading')}
        </motion.p>

        <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={`${s.label}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
                {s.value}
              </div>
              <p className="mt-2 text-sm font-medium text-brand-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
