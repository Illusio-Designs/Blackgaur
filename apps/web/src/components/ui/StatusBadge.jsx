'use client';

import { motion } from 'framer-motion';
import { statusColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export default function StatusBadge({ status, label, size = 'md', pulse = false, className }) {
  const c = statusColor(status);
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'inline-flex items-center rounded-full font-medium capitalize',
        c.bg,
        c.text,
        SIZES[size],
        className,
      )}
    >
      <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', c.dot)}>
        {pulse && (
          <span
            className={cn('absolute inline-flex h-full w-full animate-pulse-ring rounded-full', c.dot)}
          />
        )}
      </span>
      {label || String(status).replace(/_/g, ' ')}
    </motion.span>
  );
}
