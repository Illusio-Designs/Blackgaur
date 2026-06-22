'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Link2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatINR, formatDate } from '@/lib/utils';

export default function TollTransactionRow({ txn, trip }) {
  const t = useTranslations('fastag');
  if (!txn) return null;

  return (
    <div className="card flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-fastag">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-navy">{txn.plaza_name}</p>
          <p className="font-mono text-xs text-brand-muted">{txn.highway}</p>
        </div>
      </div>

      <div className="font-mono text-xs text-brand-text sm:w-28">{txn.vehicle?.registration_no}</div>

      <div className="text-xs text-brand-muted sm:w-40">{formatDate(txn.transaction_at, { withTime: true })}</div>

      <div className="sm:w-32 sm:text-right">
        {txn.trip_id ? (
          <Link
            href={`/dashboard/trips?trip=${txn.trip_id}`}
            className="inline-flex items-center gap-1 font-mono text-xs text-brand-blue hover:underline"
          >
            <Link2 className="h-3 w-3" />
            {trip?.lr_number || `Trip #${txn.trip_id}`}
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {t('unmatched')}
          </span>
        )}
      </div>

      <div className="font-mono text-sm font-semibold text-brand-navy sm:w-24 sm:text-right">
        {formatINR(txn.amount)}
      </div>
    </div>
  );
}
