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
    <div className="py-3">
      {/* Primary line: station + amount (amount never wraps / clips) */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-brand-fuel">
          <Fuel className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-brand-navy">{txn.fuel_station_name}</p>
          <p className="truncate text-xs text-brand-muted">{txn.fuel_station_city}</p>
        </div>
        <p className="shrink-0 whitespace-nowrap font-mono text-sm font-semibold text-brand-navy">
          {formatINR(txn.amount)}
        </p>
      </div>

      {/* Meta line: product · litres@rate · odometer · date · trip — wraps gracefully */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
        <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-brand-fuel">
          {t(`products.${txn.product_type}`)}
        </span>
        <span className="whitespace-nowrap font-mono text-brand-text">
          {txn.quantity_ltr} L <span className="text-brand-muted">@ {formatINR(txn.rate_per_ltr, { decimals: 2 })}</span>
        </span>
        {txn.odometer_km != null && (
          <span className="whitespace-nowrap font-mono">{txn.odometer_km.toLocaleString('en-IN')} km</span>
        )}
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
              {tf('unmatched')}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
