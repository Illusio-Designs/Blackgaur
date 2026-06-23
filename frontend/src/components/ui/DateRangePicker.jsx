'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import { cn } from '@/lib/utils';

/**
 * DateRangePicker — from/to range built on two DatePickers.
 * props { from, to, onChange({from,to}), label?, fromLabel?, toLabel?, className }
 */
export default function DateRangePicker({
  from,
  to,
  onChange,
  label,
  fromLabel,
  toLabel,
  className,
}) {
  const tc = useTranslations('common');
  return (
    <div className={cn('w-full', className)}>
      {label && <label className="label-base">{label}</label>}
      <div className="flex items-end gap-2">
        <DatePicker
          label={fromLabel || tc('from')}
          value={from}
          max={to}
          onChange={(next) => onChange?.({ from: next, to })}
        />
        <ArrowRight className="mb-3 h-4 w-4 shrink-0 text-brand-muted" />
        <DatePicker
          label={toLabel || tc('to')}
          value={to}
          min={from}
          onChange={(next) => onChange?.({ from, to: next })}
        />
      </div>
    </div>
  );
}
