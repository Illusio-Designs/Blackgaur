'use client';

import { useState, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const POSITIONS = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

/**
 * Tooltip — hover/focus popover wrapping a single child.
 * props { content, side?, className }
 */
export default function Tooltip({ content, side = 'top', children, className, block = false }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn('relative inline-flex', block && 'w-full', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className={cn(block && 'flex w-full')} aria-describedby={open ? id : undefined}>{children}</span>
      <AnimatePresence>
        {open && content && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-brand-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-elevated',
              POSITIONS[side] || POSITIONS.top,
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
