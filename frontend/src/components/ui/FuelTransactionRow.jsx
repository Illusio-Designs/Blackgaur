'use client';

import { useTranslations } from 'next-intl';
import { Fuel, Link2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatINR, formatDate } from '@/lib/utils';

export default function FuelTransactionRow({ txn, trip }) {
  const t = useTranslations('fuel');
  const tf = useTranslations('fastag');
  if (!txn) return null;

  return (
    <div className="card flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-brand-fuel">
          <Fuel className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-navy">{txn.fuel_station_name}</p>
          <p className="truncate text-xs text-brand-muted">{txn.fuel_station_city}</p>
        </div>
      </div>

      <span className="inline-flex w-fit items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-brand-fuel">
        {t(`products.${txn.product_type}`)}
      </span>

      <div className="font-mono text-xs text-brand-text sm:w-24">
        {txn.quantity_ltr} L
        <span className="ml-2 text-brand-muted">@ {formatINR(txn.rate_per_ltr, { decimals: 2 })}</span>
      </div>

      <div className="font-mono text-xs text-brand-muted sm:w-28">{txn.odometer_km?.toLocaleString('en-IN')} km</div>

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
            {tf('unmatched')}
          </span>
        )}
      </div>

      <div className="font-mono text-sm font-semibold text-brand-navy sm:w-24 sm:text-right">
        {formatINR(txn.amount)}
      </div>
    </div>
  );
}
