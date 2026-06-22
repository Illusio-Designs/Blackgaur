'use client';

import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

export default function PageHeader({ title, subtitle, actions, icon: Icon, accent = 'text-brand-blue' }) {
  return (
    <motion.div
      {...fadeUp}
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={`mt-0.5 hidden rounded-xl bg-white p-2.5 shadow-card sm:inline-flex ${accent}`}>
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-brand-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
