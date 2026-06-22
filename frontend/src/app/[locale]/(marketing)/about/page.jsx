'use client';

import { motion } from 'framer-motion';
import { Target, Compass, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { stagger, staggerItem } from '@/lib/animations';
import { initials } from '@/lib/utils';

const MILESTONES = [
  { year: '2019', title: 'The first mile', desc: 'Founded in Ahmedabad to digitise a 200-truck fleet.' },
  { year: '2021', title: 'FASTag & fuel sync', desc: 'Launched automated toll and fuel-card reconciliation.' },
  { year: '2023', title: 'RCM invoicing', desc: 'Full GST + reverse-charge invoicing for GTA operators.' },
  { year: '2024', title: '1,000+ vehicles', desc: 'Crossed a thousand tracked vehicles across 14 cities.' },
  { year: '2026', title: 'One platform', desc: 'Pickup to payment, unified for India’s transport sector.' },
];

const TEAM = [
  { name: 'Arjun Mehta', role: 'Founder & CEO' },
  { name: 'Priya Nair', role: 'Head of Product' },
  { name: 'Rohan Desai', role: 'VP Engineering' },
  { name: 'Sneha Patel', role: 'Customer Success' },
];

const MISSION = [
  { icon: Target, title: 'Transparency', desc: 'Every kilometre, toll and rupee accounted for in real time.' },
  { icon: Compass, title: 'Control', desc: 'Plan, assign and reconcile from a single source of truth.' },
  { icon: Users, title: 'Built for India', desc: 'GST, RCM, FASTag and fuel cards — native, not bolted on.' },
];

export default function AboutPage() {
  const t = useTranslations('marketing');

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
            {t('aboutTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
          >
            {t('aboutSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* mission */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {MISSION.map((m) => {
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

      {/* milestones */}
      <section className="bg-brand-surface py-20 sm:py-28">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy">
            Our journey
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

      {/* team */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-brand-navy">
            The team
          </h2>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={staggerItem}
                className="card flex flex-col items-center p-6 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy font-display text-lg font-bold text-white">
                  {initials(member.name)}
                </span>
                <p className="mt-4 font-display text-base font-semibold text-brand-navy">
                  {member.name}
                </p>
                <p className="mt-1 text-sm text-brand-muted">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
