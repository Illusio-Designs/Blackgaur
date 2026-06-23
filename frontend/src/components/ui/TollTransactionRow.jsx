'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Link2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatINR, formatDate } from '@/lib/utils';

export default function TollTransactionRow({ txn, trip }) {
  const t = useTranslations('fastag');
  if (!txn) return null;

  return (
    <div className="py-3">
      {/* Primary line: plaza + amount (amount never wraps / clips) */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-fastag">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-brand-navy">{txn.plaza_name}</p>
          <p className="truncate font-mono text-xs text-brand-muted">{txn.highway}</p>
        </div>
        <p className="shrink-0 whitespace-nowrap font-mono text-sm font-semibold text-brand-navy">
          {formatINR(txn.amount)}
        </p>
      </div>

      {/* Meta line: wraps gracefully at any width */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
        <span className="font-mono text-brand-text">{txn.vehicle?.registration_no}</span>
        <span className="text-brand-border">·</span>
        <span className="whitespace-nowrap">{formatDate(txn.transaction_at, { withTime: true })}</span>
        <span className="ml-auto">
          {txn.trip_id ? (
            <Link
              href={`/dashboard/trips?trip=${txn.trip_id}`}
              className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-brand-blue hover:underline"
            >
              <Link2 className="h-3 w-3" />
              {trip?.lr_number || `Trip #${txn.trip_id}`}
            </Link>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {t('unmatched')}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
