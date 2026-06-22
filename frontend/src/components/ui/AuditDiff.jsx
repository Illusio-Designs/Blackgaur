'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

function fmt(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function AuditDiff({ before, after }) {
  const t = useTranslations('audit');

  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));

  const changed = (key) => fmt(before?.[key]) !== fmt(after?.[key]);

  const renderColumn = (data, side) => (
    <div className="min-w-0 flex-1 rounded-lg border border-brand-border bg-white">
      <div className="border-b border-brand-border bg-brand-surface/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {side === 'before' ? t('before') : t('after')}
      </div>
      <div className="scrollbar-thin overflow-x-auto p-2 font-mono text-xs leading-relaxed">
        {data === null ? (
          <p className="px-1 py-1 italic text-brand-muted">{side === 'before' ? 'created' : 'deleted'}</p>
        ) : keys.length === 0 ? (
          <p className="px-1 py-1 italic text-brand-muted">—</p>
        ) : (
          keys.map((key) => {
            const present = data && key in data;
            const isChanged = changed(key);
            const isRemoved = side === 'before' && isChanged && present;
            const isAdded = side === 'after' && isChanged && present;
            return (
              <div
                key={key}
                className={cn(
                  'flex gap-1 rounded px-1 py-0.5',
                  isRemoved && 'bg-red-50',
                  isAdded && 'bg-emerald-50',
                  !present && 'opacity-40',
                )}
              >
                <span className="text-brand-muted">{key}:</span>
                <span
                  className={cn(
                    'break-all',
                    isRemoved ? 'text-brand-danger line-through' : isAdded ? 'text-brand-success' : 'text-brand-text',
                  )}
                >
                  {present ? fmt(data[key]) : '—'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {renderColumn(before ?? null, 'before')}
      {renderColumn(after ?? null, 'after')}
    </div>
  );
}
