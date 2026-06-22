'use client';

import { motion } from 'framer-motion';
import { Truck, ArrowRight, GripVertical, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import StatusBadge from '@/components/ui/StatusBadge';
import { cardHover } from '@/lib/animations';
import { formatINR, cn } from '@/lib/utils';

export default function TripCard({ trip, onStatusChange, draggable = false }) {
  const t = useTranslations('trips');
  if (!trip) return null;

  const isDelivered = trip.status === 'delivered';

  return (
    <motion.article
      {...cardHover}
      onClick={() => onStatusChange?.(trip)}
      className={cn(
        'card group relative cursor-pointer select-none p-3.5',
        isDelivered && 'ring-2 ring-brand-success/40 shadow-[0_0_0_4px_rgba(6,95,70,0.08)]',
      )}
    >
      {draggable && (
        <span
          className="absolute right-2 top-2 text-brand-muted/50 transition group-hover:text-brand-muted"
          aria-hidden="true"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}

      <div className="flex items-center justify-between gap-2 pr-4">
        <span className="font-mono text-xs font-semibold text-brand-blue">{trip.lr_number}</span>
        <StatusBadge status={trip.status} label={t(`status.${trip.status}`)} size="sm" pulse={trip.status === 'in_transit'} />
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
        <span className="truncate">{trip.origin_city}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
        <span className="truncate">{trip.destination_city}</span>
      </div>

      <p className="mt-1 truncate text-xs text-brand-muted">{trip.client?.company_name}</p>

      <div className="mt-3 flex items-center gap-2 border-t border-brand-border pt-2.5 text-xs text-brand-muted">
        <Truck className="h-3.5 w-3.5 shrink-0 text-brand-navy" />
        <span className="font-mono text-brand-text">{trip.vehicle?.registration_no}</span>
        <span className="text-brand-border">•</span>
        <User className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{trip.driver?.name}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-brand-muted">{t('freight')}</span>
        <span className="font-mono text-sm font-semibold text-brand-navy">
          {formatINR(trip.freight_charges)}
        </span>
      </div>
    </motion.article>
  );
}
