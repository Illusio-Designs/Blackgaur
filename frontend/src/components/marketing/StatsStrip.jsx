'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import StatsCounter from '@/components/ui/StatsCounter';
import { fadeUp } from '@/lib/animations';

const STATS = [
  { key: 'statsTrips', to: 48200, suffix: '+' },
  { key: 'statsVehicles', to: 1240, suffix: '+' },
  { key: 'statsTolls', to: 86000, prefix: '₹', suffix: '+' },
  { key: 'statsUptime', to: 99, suffix: '%' },
];

export default function StatsStrip() {
  const t = useTranslations('marketing');

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
          {t('trustedBy')}
        </motion.p>

        <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
                <StatsCounter to={s.to} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium text-brand-muted">{t(s.key)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
