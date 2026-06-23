'use client';

import { motion } from 'framer-motion';
import { Truck, Boxes, Container, Snowflake, Warehouse, MapPin, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranding } from '@/hooks/useBranding';
import { stagger, staggerItem } from '@/lib/animations';

// Map a service key to an icon + tint. Falls back gracefully for custom keys.
export const SERVICE_ICONS = {
  ftl: { Icon: Truck, tint: 'bg-brand-blue/10 text-brand-blue' },
  ptl: { Icon: Boxes, tint: 'bg-amber-50 text-brand-amber' },
  container: { Icon: Container, tint: 'bg-indigo-50 text-indigo-600' },
  coldchain: { Icon: Snowflake, tint: 'bg-teal-50 text-brand-fastag' },
  warehousing: { Icon: Warehouse, tint: 'bg-emerald-50 text-brand-success' },
  lastmile: { Icon: MapPin, tint: 'bg-orange-50 text-brand-fuel' },
};

export function serviceIcon(key) {
  return SERVICE_ICONS[key] || { Icon: Package, tint: 'bg-brand-blue/10 text-brand-blue' };
}

export default function ServicesGrid({ heading, subtitle }) {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const services = branding.content.services || [];

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
            {heading || t('servicesTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-4 text-lg text-brand-muted"
          >
            {subtitle || t('servicesSubtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((s) => {
            const { Icon, tint } = serviceIcon(s.key);
            return (
              <motion.div
                key={s.key || s.title}
                variants={staggerItem}
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="card group p-6 transition-shadow hover:shadow-elevated"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-brand-navy">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{s.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
