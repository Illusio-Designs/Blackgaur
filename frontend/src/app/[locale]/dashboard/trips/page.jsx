'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Truck, Plus, Map, LayoutGrid, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import TripCard from '@/components/ui/TripCard';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelect from '@/components/ui/MultiSelect';
import { useToast } from '@/components/ui/Toast';
import { useTrips, useUpdateTripStatus, useCreateTrip } from '@/hooks/useTrips';
import { KANBAN_COLUMNS, INDIAN_CITIES, TRIP_STATUSES } from '@/lib/constants';
import { mockClients, mockVehicles, mockDrivers } from '@/lib/mock';
import { kanbanSpring } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function TripsPage() {
  const t = useTranslations('trips');
  const tc = useTranslations('common');
  const tv = useTranslations('vehicles');
  const toast = useToast();
  const { data } = useTrips();
  const updateStatus = useUpdateTripStatus();
  const createTrip = useCreateTrip();

  const [trips, setTrips] = useState(null);
  const [view, setView] = useState('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  const statusOptions = useMemo(
    () => TRIP_STATUSES.map((s) => ({ value: s, label: t(`columns.${s}`) })),
    [t],
  );
  const [form, setForm] = useState({
    origin_city: 'Ahmedabad', origin_address: '', destination_city: 'Mumbai', destination_address: '',
    client_id: 1, vehicle_id: 2, driver_id: 11, cargo_type: '', cargo_weight_kg: '', cargo_value: '',
    planned_departure: '', freight_charges: '', eway_bill_no: '', eway_bill_expiry: '', notes: '',
  });

  // Local board state seeded from query data
  const board = useMemo(() => trips ?? data?.data ?? [], [trips, data]);
  const filtered = useMemo(
    () =>
      board.filter(
        (tr) =>
          (statusFilter.length === 0 || statusFilter.includes(tr.status)) &&
          (!search ||
            tr.lr_number?.toLowerCase().includes(search.toLowerCase()) ||
            tr.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            tr.destination_city?.toLowerCase().includes(search.toLowerCase())),
      ),
    [board, search, statusFilter],
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

  // Drag & drop between Kanban columns
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const moveTo = (id, status) => {
    const trip = (trips ?? board).find((tr) => tr.id === id);
    if (!trip || trip.status === status) return;
    const updated = (trips ?? board).map((tr) => (tr.id === id ? { ...tr, status } : tr));
    setTrips(updated);
    updateStatus.mutate({ id, status });
    if (status === 'delivered') toast.success(t('status.delivered'), trip.lr_number);
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
      origin_address: form.origin_address,
      destination_city: form.destination_city,
      destination_address: form.destination_address,
      client, vehicle, driver,
      branch: { id: 1, name: 'Ahmedabad HQ' },
      cargo_type: form.cargo_type || 'General cargo',
      cargo_weight_kg: Number(form.cargo_weight_kg) || 0,
      cargo_value: Number(form.cargo_value) || 0,
      planned_departure: form.planned_departure || null,
      freight_charges: Number(form.freight_charges) || 0,
      eway_bill_no: form.eway_bill_no,
      eway_bill_expiry: form.eway_bill_expiry || null,
      estimated_fastag_toll: 0,
      actual_fastag_toll: 0,
      fuel_consumed_ltr: 0,
      notes: form.notes,
      created_at: new Date().toISOString(),
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FormInput
          icon={Search}
          placeholder={`${tc('search')} LR / client / city…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <MultiSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder={tc('status')}
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
              <div
                onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = Number(e.dataTransfer.getData('text/plain'));
                  if (id) moveTo(id, col.key);
                  setOverCol(null);
                  setDragId(null);
                }}
                className={cn(
                  'flex flex-1 flex-col gap-3 rounded-xl border-2 border-dashed p-2 transition-colors',
                  overCol === col.key ? 'border-brand-blue bg-brand-blue/5' : 'border-transparent bg-brand-surface/40',
                )}
              >
                <AnimatePresence mode="popLayout">
                  {(grouped[col.key] || []).map((trip) => (
                    <motion.div
                      key={trip.id}
                      layout
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(trip.id)); e.dataTransfer.effectAllowed = 'move'; setDragId(trip.id); }}
                      onDragEnd={() => { setDragId(null); setOverCol(null); }}
                      initial={{ opacity: 0, y: -12, scale: 0.96 }}
                      animate={{ opacity: dragId === trip.id ? 0.4 : 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={kanbanSpring}
                      className="cursor-grab active:cursor-grabbing"
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

      <Drawer
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
          <FormInput as="select" label={`${t('route')} — ${tc('from')}`} value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={`${t('route')} — ${tc('to')}`} value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={t('client')} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            {mockClients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </FormInput>
          <FormInput as="select" label={t('vehicle')} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            {[...mockVehicles]
              .sort((a, b) => Number(b.is_available) - Number(a.is_available))
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_no} — {v.is_available ? tv('available') : tv('inUse')}
                </option>
              ))}
          </FormInput>
          <FormInput as="select" label={t('driver')} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
            {mockDrivers.map((dr) => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
          </FormInput>
          <FormInput as="textarea" label={t('originAddress')} className="sm:col-span-2" placeholder={t('pickupAddressPlaceholder')} value={form.origin_address} onChange={(e) => setForm({ ...form, origin_address: e.target.value })} />
          <FormInput as="textarea" label={t('destinationAddress')} className="sm:col-span-2" placeholder={t('deliveryAddressPlaceholder')} value={form.destination_address} onChange={(e) => setForm({ ...form, destination_address: e.target.value })} />
          <FormInput label={t('cargo')} placeholder={t('cargoPlaceholder')} value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} />
          <FormInput label={t('cargoWeight')} type="number" placeholder="14500" value={form.cargo_weight_kg} onChange={(e) => setForm({ ...form, cargo_weight_kg: e.target.value })} />
          <FormInput label={t('cargoValue')} type="number" placeholder="2400000" value={form.cargo_value} onChange={(e) => setForm({ ...form, cargo_value: e.target.value })} />
          <FormInput label={t('freight')} type="number" placeholder="48000" value={form.freight_charges} onChange={(e) => setForm({ ...form, freight_charges: e.target.value })} />
          <DatePicker label={t('plannedDeparture')} value={form.planned_departure} onChange={(v) => setForm({ ...form, planned_departure: v })} />
          <FormInput label={t('ewayBill')} placeholder="EWB-310024889" value={form.eway_bill_no} onChange={(e) => setForm({ ...form, eway_bill_no: e.target.value })} />
          <DatePicker label={t('ewayBillExpiry')} value={form.eway_bill_expiry} onChange={(v) => setForm({ ...form, eway_bill_expiry: v })} />
          <FormInput as="textarea" label={t('notes')} className="sm:col-span-2" placeholder={t('notesPlaceholder')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Drawer>
    </div>
  );
}
