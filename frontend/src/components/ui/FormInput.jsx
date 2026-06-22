'use client';

import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const FormInput = forwardRef(function FormInput(
  { label, error, icon: Icon, helpText, className, id, as = 'input', children, ...props },
  ref,
) {
  const inputId = id || props.name;
  const Tag = as;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-base">
          {label}
        </label>
      )}
      <motion.div
        animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        )}
        {as === 'select' ? (
          <select
            ref={ref}
            id={inputId}
            className={cn('input-base appearance-none', Icon && 'pl-9', error && 'border-brand-danger focus:ring-brand-danger/20', className)}
            {...props}
          >
            {children}
          </select>
        ) : (
          <Tag
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              Icon && 'pl-9',
              as === 'textarea' && 'min-h-[88px] resize-y',
              error && 'border-brand-danger focus:ring-brand-danger/20',
              className,
            )}
            {...props}
          />
        )}
      </motion.div>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-xs font-medium text-brand-danger"
          >
            {error}
          </motion.p>
        ) : helpText ? (
          <p className="mt-1 text-xs text-brand-muted">{helpText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

export default FormInput;
