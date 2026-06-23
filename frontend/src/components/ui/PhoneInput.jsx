'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PHONE_COUNTRIES = [
  { code: 'IN', dial: '+91', flag: '🇮🇳', label: 'India', maxLength: 10 },
  { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States', maxLength: 10 },
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'United Kingdom', maxLength: 10 },
  { code: 'AE', dial: '+971', flag: '🇦🇪', label: 'UAE', maxLength: 9 },
];

/**
 * PhoneInput — phone field with country flag + dial code segment.
 * props { value, onChange(digitsOnly), country?, onCountryChange?, label?, error?, name?, placeholder?, disabled?, className }
 */
export default function PhoneInput({
  value = '',
  onChange,
  country = 'IN',
  onCountryChange,
  label,
  error,
  name,
  placeholder,
  disabled = false,
  className,
}) {
  const [internalCountry, setInternalCountry] = useState(country);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const activeCode = onCountryChange ? country : internalCountry;
  const active = PHONE_COUNTRIES.find((c) => c.code === activeCode) || PHONE_COUNTRIES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const selectCountry = (c) => {
    if (onCountryChange) onCountryChange(c.code);
    else setInternalCountry(c.code);
    setOpen(false);
    // Re-clamp the current value to the new country's max length.
    const clamped = value.replace(/\D/g, '').slice(0, c.maxLength);
    if (clamped !== value) onChange?.(clamped);
  };

  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, active.maxLength);
    onChange?.(digits);
  };

  return (
    <div className={cn('w-full', className)} ref={rootRef}>
      {label && (
        <label htmlFor={name} className="label-base">
          {label}
        </label>
      )}
      <motion.div
        animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border border-brand-border bg-white transition focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20',
          error && 'border-brand-danger focus-within:border-brand-danger focus-within:ring-brand-danger/20',
          disabled && 'opacity-60',
        )}
      >
        <div className="relative shrink-0 border-r border-brand-border">
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => !disabled && setOpen((v) => !v)}
            className="btn-focus flex h-full items-center gap-1.5 px-3 text-sm text-brand-text transition hover:bg-brand-surface"
          >
            <span className="text-base leading-none">{active.flag}</span>
            <span className="font-medium">{active.dial}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-brand-muted transition', open && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-brand-border bg-white p-1 shadow-elevated"
              >
                {PHONE_COUNTRIES.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={c.code === active.code}
                      onClick={() => selectCountry(c)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-brand-surface',
                        c.code === active.code ? 'font-medium text-brand-navy' : 'text-brand-text',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.label}</span>
                        <span className="text-brand-muted">{c.dial}</span>
                      </span>
                      {c.code === active.code && <Check className="h-4 w-4 shrink-0 text-brand-blue" />}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <input
          id={name}
          name={name}
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          value={value}
          onChange={handleInput}
          placeholder={placeholder || '0'.repeat(active.maxLength)}
          maxLength={active.maxLength}
          className="w-full bg-transparent px-3.5 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/70 focus:outline-none"
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-xs font-medium text-brand-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
