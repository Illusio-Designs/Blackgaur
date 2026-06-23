'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Tabs — controlled tab list with optional panels.
 * props {
 *   tabs: [{ value, label, icon? }],
 *   value, onChange(value),
 *   className,
 *   children?  // optional panel content for the active tab
 * }
 */
export default function Tabs({ tabs = [], value, onChange, className, children }) {
  const layoutId = useRef(`tabs-${Math.random().toString(36).slice(2)}`).current;

  const activeIndex = Math.max(0, tabs.findIndex((tb) => tb.value === value));

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (activeIndex + dir + tabs.length) % tabs.length;
    onChange?.(tabs[next].value);
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="inline-flex flex-wrap gap-1 rounded-xl border border-brand-border bg-white p-1"
      >
        {tabs.map((tb) => {
          const isActive = tb.value === value;
          const Icon = tb.icon;
          return (
            <button
              key={tb.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange?.(tb.value)}
              className={cn(
                'btn-focus relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition',
                isActive ? 'text-white' : 'text-brand-muted hover:bg-brand-surface hover:text-brand-navy',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-lg bg-brand-navy"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {Icon && <Icon className="h-4 w-4" />}
                {tb.label}
              </span>
            </button>
          );
        })}
      </div>
      {children != null && (
        <div role="tabpanel" className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}
