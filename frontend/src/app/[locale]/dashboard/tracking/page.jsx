'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Gauge, Clock, Truck } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useLiveTracking } from '@/hooks/useTracking';
import { stagger, staggerItem } from '@/lib/animations';
import { timeAgo } from '@/lib/utils';

// Leaflet touches `window`, so the map is loaded client-only.
const LiveMap = dynamic(() => import('@/components/tracking/LiveMap'), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full rounded-2xl" />,
});

export default function TrackingPage() {
  const t = useTranslations('tracking');
  const tt = useTranslations('trips');
  const { data } = useLiveTracking();

  const positions = data?.data ?? [];

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={MapPin} accent="text-brand-blue" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live map */}
        <div className="card relative h-[420px] overflow-hidden p-0 lg:col-span-2">
          <LiveMap positions={positions} speedLabel={t('kmh')} />
          <div className="pointer-events-none absolute right-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-brand-success/10 px-2.5 py-1 text-xs font-semibold text-brand-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-success" /> {t('live')}
          </div>
        </div>

        {/* Live vehicle list */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {positions.length === 0 ? (
            <div className="card"><EmptyState icon={Truck} title={t('noDevices')} subtitle={t('mapNote')} /></div>
          ) : (
            positions.map((p) => (
              <motion.div key={p.vehicle_id} variants={staggerItem} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-brand-navy">{p.registration_no}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> {timeAgo(p.recorded_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-brand-muted">
                  {[p.trip?.lr_number, p.driver?.name].filter(Boolean).join(' · ') || p.gps_device_id}
                </p>
                {p.trip && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-text">
                    <Navigation className="h-3.5 w-3.5 text-brand-blue" /> {p.trip.origin_city} → {p.trip.destination_city}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-brand-muted">
                  {p.speed_kmph != null && (
                    <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {p.speed_kmph} {t('kmh')}</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
