'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollText, Plus, MapPin } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import Timeline from '@/components/ui/Timeline';
import { useToast } from '@/components/ui/Toast';
import { useTrips } from '@/hooks/useTrips';
import { formatINR } from '@/lib/utils';
import { INDIAN_CITIES } from '@/lib/constants';
import { mockClients, mockVehicles, mockDrivers } from '@/lib/mock';

const STEP_ORDER = ['planned', 'loading', 'in_transit', 'delivered'];
const EMPTY_LR = { client_id: '', origin_city: 'Ahmedabad', destination_city: 'Mumbai', vehicle_id: '', driver_id: '', freight_charges: '', cargo_type: '' };

export default function LrBoardPage() {
  const t = useTranslations('lr');
  const tt = useTranslations('trips');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data, isLoading } = useTrips();
  const [track, setTrack] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_LR);

  const submitCreate = () => {
    setCreateOpen(false);
    setForm(EMPTY_LR);
    toast.success(t('createLr'), `${form.origin_city} → ${form.destination_city}`);
  };

  const rows = data?.data ?? [];

  const columns = useMemo(
    () => [
      { accessorKey: 'lr_number', header: tt('lrNumber'), cell: ({ row }) => <span className="font-mono text-sm font-medium text-brand-navy">{row.original.lr_number}</span> },
      { id: 'route', header: tt('route'), accessorFn: (r) => r.origin_city, cell: ({ row }) => <span className="text-brand-text">{row.original.origin_city} → {row.original.destination_city}</span> },
      { id: 'client', header: tt('client'), accessorFn: (r) => r.client?.company_name, cell: ({ row }) => row.original.client?.company_name },
      { accessorKey: 'freight_charges', header: tt('freight'), cell: ({ row }) => <span className="font-mono">{formatINR(row.original.freight_charges)}</span> },
      { accessorKey: 'status', header: tc('status'), cell: ({ row }) => <StatusBadge status={row.original.status} label={tt(`status.${row.original.status}`)} /> },
      { id: 'actions', header: tc('actions'), enableSorting: false, cell: ({ row }) => <Button size="sm" variant="outline" icon={MapPin} onClick={() => setTrack(row.original)}>{t('quickTrack')}</Button> },
    ],
    [t, tt, tc],
  );

  const trackSteps = useMemo(() => {
    if (!track) return [];
    const idx = STEP_ORDER.indexOf(track.status);
    const labels = { planned: tt('status.planned'), loading: tt('status.loading'), in_transit: tt('status.in_transit'), delivered: tt('status.delivered') };
    return STEP_ORDER.map((s, i) => ({
      label: labels[s],
      status: track.status === 'cancelled' ? 'pending' : i < idx ? 'done' : i === idx ? 'active' : 'pending',
    }));
  }, [track, tt]);

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={ScrollText} actions={<Button variant="amber" icon={Plus} onClick={() => setCreateOpen(true)}>{t('createLr')}</Button>} />
      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />

      <Modal open={!!track} onClose={() => setTrack(null)} title={`${t('quickTrack')} — ${track?.lr_number || ''}`} size="md">
        {track && (
          <div>
            <div className="mb-4 rounded-xl bg-brand-surface p-3 text-sm">
              <p className="font-medium text-brand-navy">{track.origin_city} → {track.destination_city}</p>
              <p className="text-xs text-brand-muted">{track.client?.company_name} · {track.vehicle?.registration_no}</p>
            </div>
            <Timeline steps={trackSteps} />
          </div>
        )}
      </Modal>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('createLr')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>{tc('cancel')}</Button>
            <Button variant="amber" onClick={submitCreate}>{tc('create')}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput as="select" label={tt('client')} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">—</option>
            {mockClients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </FormInput>
          <FormInput as="select" label={tt('vehicle')} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            <option value="">—</option>
            {mockVehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_no}</option>)}
          </FormInput>
          <FormInput as="select" label={`${tt('route')} — From`} value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={`${tt('route')} — To`} value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={tt('driver')} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
            <option value="">—</option>
            {mockDrivers.map((dr) => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
          </FormInput>
          <FormInput label={tt('freight')} type="number" placeholder="48000" value={form.freight_charges} onChange={(e) => setForm({ ...form, freight_charges: e.target.value })} />
          <FormInput label={tt('cargo')} className="sm:col-span-2" placeholder="Industrial goods" value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} />
        </div>
      </Drawer>
    </div>
  );
}
