'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

export default function KPICard({
  label,
  value,
  delta,
  trend = 'up',
  icon: Icon,
  format = (v) => Math.round(v).toLocaleString('en-IN'),
  loading = false,
  accent = 'text-brand-blue',
  className,
}) {
  const display = useCountUp(value || 0);

  if (loading) {
    return (
      <div className={cn('card p-5', className)}>
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-8 w-32" />
      </div>
    );
  }

  return (
    <motion.div {...fadeUp} className={cn('card p-5', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-brand-muted">{label}</p>
        {Icon && (
          <span className={cn('rounded-lg bg-brand-surface p-2', accent)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-brand-navy">
        {format(display)}
      </p>
      {delta != null && (
        <div
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-xs font-medium',
            trend === 'up' ? 'text-brand-success' : 'text-brand-danger',
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {delta}
        </div>
      )}
    </motion.div>
  );
}
