'use client';

import { motion } from 'framer-motion';
import { Target, Compass, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranding } from '@/hooks/useBranding';
import { stagger, staggerItem } from '@/lib/animations';

const MILESTONES = [
  { year: '2015', title: 'First fleet on the road', desc: 'Started with a handful of trucks moving freight across Gujarat.' },
  { year: '2018', title: 'Pan-India corridors', desc: 'Expanded into the western and northern industrial corridors.' },
  { year: '2021', title: 'Tech-driven operations', desc: 'GPS tracking and FASTag-enabled fleet for full trip visibility.' },
  { year: '2023', title: 'GST & RCM billing', desc: 'Compliant invoicing with reverse-charge (RCM) handling.' },
  { year: '2026', title: 'A trusted network', desc: 'A growing network of owned and attached vehicles nationwide.' },
];

const VALUES = [
  { icon: Target, title: 'Reliability', desc: 'On-time pickup and delivery, every consignment, every route.' },
  { icon: Compass, title: 'Transparency', desc: 'Live tracking and clear, GST-compliant billing — no surprises.' },
  { icon: Users, title: 'Built for India', desc: 'Freight handling tuned to Indian highways, tolls and compliance.' },
];

export default function AboutPage() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const about = branding.content.about;
  const stats = branding.content.stats || [];

  return (
    <div className="bg-white">
      {/* hero */}
      <section className="bg-brand-navy px-4 pt-36 pb-24 text-center text-white">
        <div className="container-page">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {about.heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
          >
            {about.body}
          </motion.p>
        </div>
      </section>

      {/* stats band */}
      {stats.length > 0 && (
        <section className="border-b border-brand-border bg-white py-14">
          <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
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
        </section>
      )}

      {/* values */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {VALUES.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div key={m.title} variants={staggerItem} className="card p-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-brand-navy">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{m.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* journey */}
      <section className="bg-brand-surface py-20 sm:py-28">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy">
            {t('aboutJourney')}
          </h2>
          <div className="relative mt-12 pl-8">
            <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-0.5 bg-brand-border" />
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative pb-10 last:pb-0"
              >
                <span className="absolute -left-8 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-brand-amber shadow" />
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold text-brand-blue">{m.year}</span>
                  <h3 className="font-display text-lg font-semibold text-brand-navy">{m.title}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-brand-muted">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
