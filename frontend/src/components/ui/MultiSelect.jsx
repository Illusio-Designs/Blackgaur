'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MultiSelect — multi-select dropdown with chips in the trigger.
 * props { value:[], onChange(values), options:[{value,label,icon?}],
 *         placeholder, searchable?, label?, disabled?, className }
 */
export default function MultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder = 'Select…',
  searchable = false,
  label,
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!searchable || !query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
    if (!open) setQuery('');
  }, [open, searchable]);

  const toggle = (opt) => {
    if (value.includes(opt.value)) {
      onChange?.(value.filter((v) => v !== opt.value));
    } else {
      onChange?.([...value, opt.value]);
    }
  };

  const removeChip = (e, v) => {
    e.stopPropagation();
    onChange?.(value.filter((x) => x !== v));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) toggle(filtered[activeIndex]);
    }
  };

  return (
    <div className={cn('w-full', className)} ref={rootRef}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className={cn(
            'input-base flex min-h-[42px] items-center justify-between gap-2 text-left',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length === 0 ? (
              <span className="text-brand-muted/70">{placeholder}</span>
            ) : (
              selectedOptions.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1 rounded-md bg-brand-blue/10 px-1.5 py-0.5 text-xs font-medium text-brand-blue"
                >
                  {o.label}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${o.label}`}
                    onClick={(e) => removeChip(e, o.value)}
                    className="rounded p-0.5 hover:bg-brand-blue/20"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {selectedOptions.length > 0 && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear all"
                onClick={clearAll}
                className="rounded p-0.5 text-brand-muted hover:bg-brand-surface hover:text-brand-navy"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <ChevronDown className={cn('h-4 w-4 text-brand-muted transition', open && 'rotate-180')} />
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-brand-border bg-white shadow-elevated"
            >
              {searchable && (
                <div className="flex items-center gap-2 border-b border-brand-border px-3 py-2">
                  <Search className="h-4 w-4 text-brand-muted" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Search…"
                    className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-muted/70 focus:outline-none"
                  />
                </div>
              )}
              <ul role="listbox" aria-multiselectable className="scrollbar-thin max-h-60 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-brand-muted">No options</li>
                ) : (
                  filtered.map((opt, i) => {
                    const isSelected = value.includes(opt.value);
                    const Icon = opt.icon;
                    return (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => toggle(opt)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
                            i === activeIndex ? 'bg-brand-surface' : 'hover:bg-brand-surface',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition',
                              isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-border bg-white',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          {Icon && <Icon className="h-4 w-4 shrink-0 text-brand-muted" />}
                          <span className={cn('truncate', isSelected ? 'font-medium text-brand-navy' : 'text-brand-text')}>
                            {opt.label}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
