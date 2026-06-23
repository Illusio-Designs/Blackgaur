'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Checkbox — accessible custom checkbox.
 * props { checked, onChange(next), label?, disabled?, name?, className }
 */
export default function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  name,
  className,
}) {
  const toggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 text-sm text-brand-text',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        name={name}
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : name}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'btn-focus flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition',
          checked
            ? 'border-brand-blue bg-brand-blue text-white'
            : 'border-brand-border bg-white hover:border-brand-blue/50',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
