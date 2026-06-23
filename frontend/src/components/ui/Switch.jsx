'use client';

import { cn } from '@/lib/utils';

/**
 * Switch — accessible toggle (role="switch").
 * props { checked, onChange(next), label?, description?, disabled?, name?, className }
 */
export default function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  name,
  className,
}) {
  const toggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const control = (
    <span
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition',
        checked ? 'bg-brand-blue' : 'bg-brand-border',
        disabled && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </span>
  );

  if (!label && !description) {
    return (
      <button
        type="button"
        role="switch"
        name={name}
        aria-checked={checked}
        aria-label={name}
        disabled={disabled}
        onClick={toggle}
        className={cn('btn-focus rounded-full', disabled && 'cursor-not-allowed', className)}
      >
        {control}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      name={name}
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'btn-focus flex w-full items-start justify-between gap-4 rounded-xl border border-brand-border bg-white p-4 text-left transition hover:border-brand-blue/40',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-brand-navy">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-brand-muted">{description}</span>
        ) : null}
      </span>
      <span className="mt-0.5">{control}</span>
    </button>
  );
}
