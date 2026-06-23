'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Local yyyy-mm-dd (avoids UTC offset bugs from toISOString).
function toISO(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  // yyyy-mm-dd → local date
  const parts = String(value).split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * DatePicker — custom calendar popover.
 * props { value (yyyy-mm-dd or Date), onChange(yyyy-mm-dd), label?, min?, max?, placeholder?, error?, disabled?, className }
 */
export default function DatePicker({
  value,
  onChange,
  label,
  min,
  max,
  placeholder = 'Select date',
  error,
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const today = new Date();
  const [viewDate, setViewDate] = useState(selected || today);
  const rootRef = useRef(null);

  const minDate = parseValue(min);
  const maxDate = parseValue(max);

  useEffect(() => {
    if (selected) setViewDate(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));

  const isDisabled = (d) => (minDate && d < stripTime(minDate)) || (maxDate && d > stripTime(maxDate));

  const pick = (d) => {
    if (isDisabled(d)) return;
    onChange?.(toISO(d));
    setOpen(false);
  };

  return (
    <div className={cn('w-full', className)} ref={rootRef}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <motion.button
          type="button"
          disabled={disabled}
          animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            'input-base flex items-center justify-between gap-2 text-left',
            disabled && 'cursor-not-allowed opacity-60',
            error && 'border-brand-danger focus:ring-brand-danger/20',
          )}
        >
          <span className={cn(!selected && 'text-brand-muted/70')}>
            {selected ? formatDate(selected) : placeholder}
          </span>
          <Calendar className="h-4 w-4 shrink-0 text-brand-muted" />
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1.5 w-[17rem] rounded-xl border border-brand-border bg-white p-3 shadow-elevated"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="btn-focus rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-surface hover:text-brand-navy"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-brand-navy">
                  {MONTHS[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="btn-focus rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-surface hover:text-brand-navy"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-1 text-[11px] font-medium text-brand-muted">
                    {w}
                  </span>
                ))}
                {cells.map((d, i) =>
                  d ? (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled(d)}
                      onClick={() => pick(d)}
                      aria-current={sameDay(d, today) ? 'date' : undefined}
                      className={cn(
                        'btn-focus flex h-8 w-8 items-center justify-center rounded-lg text-sm transition',
                        sameDay(d, selected)
                          ? 'bg-brand-blue font-semibold text-white'
                          : sameDay(d, today)
                            ? 'border border-brand-blue/50 text-brand-navy hover:bg-brand-surface'
                            : 'text-brand-text hover:bg-brand-surface',
                        isDisabled(d) && 'cursor-not-allowed opacity-30 hover:bg-transparent',
                      )}
                    >
                      {d.getDate()}
                    </button>
                  ) : (
                    <span key={i} />
                  ),
                )}
              </div>
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

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
