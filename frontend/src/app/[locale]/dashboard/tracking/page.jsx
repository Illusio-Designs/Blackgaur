'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Gauge, Clock, Truck } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useTrips } from '@/hooks/useTrips';
import { stagger, staggerItem } from '@/lib/animations';
import { cn, timeAgo } from '@/lib/utils';

// Deterministic mock GPS telemetry per trip (demo — replace with device feed).
function telemetry(trip, i) {
  const seed = (trip.id * 37) % 100;
  return {
    location: trip.origin_city + ' → ' + trip.destination_city,
    near: ['Vadodara bypass', 'NH-48, Bharuch', 'Kishangarh toll', 'Nagpur ring road'][i % 4],
    speed: 48 + (seed % 30),
    progress: 30 + (seed % 55),
    eta: ['4h 20m', '7h 05m', '2h 40m', '11h 15m'][i % 4],
    pingMin: 1 + (seed % 4),
    // map marker position (% within the map placeholder)
    top: 18 + ((trip.id * 13) % 60),
    left: 12 + ((trip.id * 23) % 72),
  };
}

export default function TrackingPage() {
  const t = useTranslations('tracking');
  const tt = useTranslations('trips');
  const { data } = useTrips();

  const active = useMemo(
    () => (data?.data ?? []).filter((tr) => tr.status === 'in_transit').map((tr, i) => ({ trip: tr, gps: telemetry(tr, i) })),
    [data],
  );

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={MapPin} accent="text-brand-blue" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Map */}
        <div className="card relative h-[420px] overflow-hidden lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(26,86,219,0.08),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(15,118,110,0.08),transparent_55%)]" />
          {/* faux grid */}
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)', backgroundSize: '40px 40px' }}
          />
          {active.map(({ trip, gps }) => (
            <div key={trip.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${gps.top}%`, left: `${gps.left}%` }}>
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue/60" />
                <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-blue ring-2 ring-white" />
              </span>
              <span className="mt-1 block whitespace-nowrap rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand-navy shadow-card">
                {trip.vehicle?.registration_no}
              </span>
            </div>
          ))}
          <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs text-brand-muted shadow-card backdrop-blur">
            {t('mapNote')}
          </div>
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-success/10 px-2.5 py-1 text-xs font-semibold text-brand-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-success" /> {t('live')}
          </div>
        </div>

        {/* Live vehicle list */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {active.length === 0 ? (
            <div className="card"><EmptyState icon={Truck} title={t('noActive')} /></div>
          ) : (
            active.map(({ trip, gps }) => (
              <motion.div key={trip.id} variants={staggerItem} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-brand-navy">{trip.vehicle?.registration_no}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> {timeAgo(Date.now() - gps.pingMin * 60000)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-brand-muted">{trip.lr_number} · {trip.driver?.name}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-text">
                  <Navigation className="h-3.5 w-3.5 text-brand-blue" /> {gps.near}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-brand-muted">
                  <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {gps.speed} {t('kmh')}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t('eta')} {gps.eta}</span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] text-brand-muted"><span>{tt('route')}</span><span>{gps.progress}%</span></div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-surface">
                    <div className={cn('h-full rounded-full bg-brand-blue')} style={{ width: `${gps.progress}%` }} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
