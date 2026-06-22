'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Truck, Plus, Map, LayoutGrid, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import TripCard from '@/components/ui/TripCard';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import { useToast } from '@/components/ui/Toast';
import { useTrips, useUpdateTripStatus, useCreateTrip } from '@/hooks/useTrips';
import { KANBAN_COLUMNS, INDIAN_CITIES, TRIP_STATUSES } from '@/lib/constants';
import { mockClients, mockVehicles, mockDrivers } from '@/lib/mock';
import { kanbanSpring } from '@/lib/animations';

export default function TripsPage() {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data } = useTrips();
  const updateStatus = useUpdateTripStatus();
  const createTrip = useCreateTrip();

  const [trips, setTrips] = useState(null);
  const [view, setView] = useState('board');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    origin_city: 'Ahmedabad', destination_city: 'Mumbai', client_id: 1,
    vehicle_id: 1, driver_id: 11, cargo_type: '', freight_charges: '',
  });

  // Local board state seeded from query data
  const board = useMemo(() => trips ?? data?.data ?? [], [trips, data]);
  const filtered = useMemo(
    () =>
      board.filter(
        (tr) =>
          !search ||
          tr.lr_number?.toLowerCase().includes(search.toLowerCase()) ||
          tr.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
          tr.destination_city?.toLowerCase().includes(search.toLowerCase()),
      ),
    [board, search],
  );

  const grouped = useMemo(() => {
    const g = {};
    TRIP_STATUSES.forEach((s) => (g[s] = []));
    filtered.forEach((tr) => (g[tr.status] ||= []).push(tr));
    return g;
  }, [filtered]);

  const moveNext = (trip) => {
    const order = ['planned', 'loading', 'in_transit', 'delivered'];
    const idx = order.indexOf(trip.status);
    if (idx < 0 || idx >= order.length - 1) return;
    const next = order[idx + 1];
    const updated = (trips ?? board).map((tr) => (tr.id === trip.id ? { ...tr, status: next } : tr));
    setTrips(updated);
    updateStatus.mutate({ id: trip.id, status: next });
    if (next === 'delivered') toast.success(t('status.delivered'), trip.lr_number);
  };

  const submitCreate = () => {
    const client = mockClients.find((c) => c.id === Number(form.client_id));
    const vehicle = mockVehicles.find((v) => v.id === Number(form.vehicle_id));
    const driver = mockDrivers.find((dr) => dr.id === Number(form.driver_id));
    const newTrip = {
      id: Date.now(),
      lr_number: `LR-2024-25-${String(board.length + 1).padStart(4, '0')}`,
      status: 'planned',
      origin_city: form.origin_city,
      destination_city: form.destination_city,
      client, vehicle, driver,
      cargo_type: form.cargo_type || 'General cargo',
      freight_charges: Number(form.freight_charges) || 0,
    };
    setTrips([newTrip, ...board]);
    createTrip.mutate(newTrip);
    setCreateOpen(false);
    toast.success(tc('create'), newTrip.lr_number);
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={Truck}
        actions={
          <>
            <div className="hidden rounded-xl border border-brand-border bg-white p-0.5 sm:flex">
              <button onClick={() => setView('board')} className={`rounded-lg px-2.5 py-1.5 text-sm ${view === 'board' ? 'bg-brand-surface text-brand-navy' : 'text-brand-muted'}`} aria-label={t('boardView')}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView('map')} className={`rounded-lg px-2.5 py-1.5 text-sm ${view === 'map' ? 'bg-brand-surface text-brand-navy' : 'text-brand-muted'}`} aria-label={t('mapView')}>
                <Map className="h-4 w-4" />
              </button>
            </div>
            <Button variant="amber" icon={Plus} onClick={() => setCreateOpen(true)}>{t('createTrip')}</Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <FormInput
          icon={Search}
          placeholder={`${tc('search')} LR / client / city…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {view === 'map' ? (
        <div className="card flex h-[60vh] items-center justify-center bg-gradient-to-br from-brand-navy/5 to-brand-blue/5 text-brand-muted">
          <div className="text-center">
            <Map className="mx-auto h-10 w-10 text-brand-blue/40" />
            <p className="mt-2 text-sm">{t('mapView')} — live GPS positions (map embed)</p>
          </div>
        </div>
      ) : (
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.key} className="flex w-[300px] shrink-0 flex-col">
              <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.accent }} />
                  <span className="text-sm font-semibold text-brand-navy">{t(`columns.${col.key}`)}</span>
                </div>
                <motion.span
                  key={grouped[col.key]?.length}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                  className="rounded-full bg-brand-surface px-2 py-0.5 text-xs font-semibold text-brand-muted"
                >
                  {grouped[col.key]?.length || 0}
                </motion.span>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-xl bg-brand-surface/40 p-2">
                <AnimatePresence mode="popLayout">
                  {(grouped[col.key] || []).map((trip) => (
                    <motion.div
                      key={trip.id}
                      layout
                      initial={{ opacity: 0, y: -12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={kanbanSpring}
                    >
                      <TripCard trip={trip} draggable onStatusChange={() => moveNext(trip)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(grouped[col.key]?.length || 0) === 0 && (
                  <div className="rounded-lg border border-dashed border-brand-border py-8 text-center text-xs text-brand-muted">
                    {tc('noData')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('createTrip')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>{tc('cancel')}</Button>
            <Button variant="amber" onClick={submitCreate} loading={createTrip.isPending}>{tc('create')}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput as="select" label={t('route') + ' — From'} value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={t('route') + ' — To'} value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={t('client')} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            {mockClients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </FormInput>
          <FormInput as="select" label={t('vehicle')} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            {mockVehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_no}</option>)}
          </FormInput>
          <FormInput as="select" label={t('driver')} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
            {mockDrivers.map((dr) => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
          </FormInput>
          <FormInput label={t('freight')} type="number" placeholder="48000" value={form.freight_charges} onChange={(e) => setForm({ ...form, freight_charges: e.target.value })} />
          <FormInput label={t('cargo')} className="sm:col-span-2" placeholder="Industrial goods" value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
