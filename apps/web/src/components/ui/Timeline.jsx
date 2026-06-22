'use client';

import { motion } from 'framer-motion';
import { Check, Circle, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Timeline({ steps = [] }) {
  return (
    <ol className="relative flex flex-col">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const status = step.status || 'pending';
        return (
          <li key={step.label + i} className="relative flex gap-3 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5',
                  status === 'done' ? 'bg-brand-success' : 'bg-brand-border',
                )}
                aria-hidden="true"
              />
            )}

            {/* Dot */}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              {status === 'done' ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-success text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : status === 'active' ? (
                <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-brand-blue"
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <Dot className="relative h-5 w-5" />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-border bg-white text-brand-muted">
                  <Circle className="h-2.5 w-2.5" />
                </span>
              )}
            </span>

            {/* Content */}
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  status === 'pending' ? 'text-brand-muted' : 'text-brand-navy',
                  status === 'active' && 'text-brand-blue',
                )}
              >
                {step.label}
              </p>
              {step.time && <p className="mt-0.5 text-xs text-brand-muted">{step.time}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
