'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm',
  amber: 'bg-brand-amber text-white hover:bg-brand-amber/90 shadow-sm',
  ghost: 'bg-transparent text-brand-text hover:bg-brand-surface',
  outline: 'border border-brand-border bg-white text-brand-navy hover:bg-brand-surface',
  danger: 'bg-brand-danger text-white hover:bg-brand-danger/90 shadow-sm',
  success: 'bg-brand-success text-white hover:bg-brand-success/90 shadow-sm',
  navy: 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-sm',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 w-10',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconRight,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'btn-focus inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
});

export default Button;
