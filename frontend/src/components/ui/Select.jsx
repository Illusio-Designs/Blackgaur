'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Select — custom single-select dropdown (not native <select>).
 * props { value, onChange(value), options:[{value,label,icon?}], placeholder,
 *         searchable?, disabled?, label?, error?, name?, className }
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  searchable = false,
  disabled = false,
  label,
  error,
  name,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = useMemo(() => {
    if (!searchable || !query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query, searchable]);

  // Click-outside close
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
    if (open) {
      const idx = filtered.findIndex((o) => o.value === value);
      setActiveIndex(idx);
    } else {
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
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
      if (filtered[activeIndex]) choose(filtered[activeIndex]);
    }
  };

  const SelectedIcon = selected?.icon;

  return (
    <div className={cn('w-full', className)} ref={rootRef}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <motion.button
          type="button"
          name={name}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className={cn(
            'input-base flex items-center justify-between gap-2 text-left',
            disabled && 'cursor-not-allowed opacity-60',
            error && 'border-brand-danger focus:ring-brand-danger/20',
          )}
        >
          <span className={cn('flex min-w-0 items-center gap-2', !selected && 'text-brand-muted/70')}>
            {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-brand-muted" />}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-brand-muted transition', open && 'rotate-180')} />
        </motion.button>

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
              <ul role="listbox" className="scrollbar-thin max-h-60 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-brand-muted">No options</li>
                ) : (
                  filtered.map((opt, i) => {
                    const isSelected = opt.value === value;
                    const Icon = opt.icon;
                    return (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => choose(opt)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={cn(
                            'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                            i === activeIndex ? 'bg-brand-surface' : 'hover:bg-brand-surface',
                            isSelected ? 'font-medium text-brand-navy' : 'text-brand-text',
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {Icon && <Icon className="h-4 w-4 shrink-0 text-brand-muted" />}
                            <span className="truncate">{opt.label}</span>
                          </span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-blue" />}
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
