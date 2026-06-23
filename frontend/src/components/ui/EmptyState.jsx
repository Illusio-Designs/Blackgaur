'use client';

import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

/**
 * EmptyState — icon + title + subtitle + optional action.
 * props { icon, title, subtitle?, action?, className }
 */
export default function EmptyState({ icon: Icon = Inbox, title, subtitle, action, className }) {
  return (
    <motion.div
      {...fadeUp}
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-muted">
        <Icon className="h-7 w-7" />
      </span>
      {title && <p className="mt-4 font-display text-base font-semibold text-brand-navy">{title}</p>}
      {subtitle && <p className="mt-1 max-w-sm text-sm text-brand-muted">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
