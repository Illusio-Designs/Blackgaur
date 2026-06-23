'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollText, Plus, MapPin, Download } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import DatePicker from '@/components/ui/DatePicker';
import Timeline from '@/components/ui/Timeline';
import { useToast } from '@/components/ui/Toast';
import Tooltip from '@/components/ui/Tooltip';
import { useTrips } from '@/hooks/useTrips';
import { useBranding } from '@/hooks/useBranding';
import { downloadLrPdf } from '@/lib/lrPdf';
import { formatINR } from '@/lib/utils';
import { INDIAN_CITIES } from '@/lib/constants';
import { mockClients, mockVehicles, mockDrivers } from '@/lib/mock';

const STEP_ORDER = ['planned', 'loading', 'in_transit', 'delivered'];
const EMPTY_LR = {
  client_id: '', origin_city: 'Ahmedabad', origin_address: '', destination_city: 'Mumbai', destination_address: '',
  vehicle_id: '', driver_id: '', cargo_type: '', cargo_weight_kg: '', cargo_value: '',
  planned_departure: '', freight_charges: '', eway_bill_no: '', eway_bill_expiry: '', notes: '',
};

export default function LrBoardPage() {
  const t = useTranslations('lr');
  const tt = useTranslations('trips');
  const tc = useTranslations('common');
  const tv = useTranslations('vehicles');
  const ti = useTranslations('invoices');
  const toast = useToast();
  const { branding } = useBranding();
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
      { id: 'actions', header: tc('actions'), enableSorting: false, cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={MapPin} onClick={() => setTrack(row.original)}>{t('quickTrack')}</Button>
          <Tooltip content={ti('downloadPdf')}>
            <Button size="sm" variant="ghost" icon={Download} aria-label={ti('downloadPdf')} onClick={() => downloadLrPdf(row.original, branding)} />
          </Tooltip>
        </div>
      ) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tt, tc, ti, branding],
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

      <Modal
        open={!!track}
        onClose={() => setTrack(null)}
        title={`${t('quickTrack')} — ${track?.lr_number || ''}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTrack(null)}>{tc('cancel')}</Button>
            <Button variant="amber" icon={Download} onClick={() => downloadLrPdf(track, branding)}>{ti('downloadPdf')}</Button>
          </>
        }
      >
        {track && (
          <div>
            <div className="mb-4 rounded-xl bg-brand-surface p-3 text-sm">
              <p className="font-medium text-brand-navy">{track.origin_city} → {track.destination_city}</p>
              <p className="text-xs text-brand-muted">{track.client?.company_name} · {track.vehicle?.registration_no} · {track.driver?.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-brand-muted">
                <span>{tt('cargo')}: <span className="text-brand-text">{track.cargo_type}</span></span>
                <span>{tt('cargoWeight')}: <span className="font-mono text-brand-text">{track.cargo_weight_kg} kg</span></span>
                <span>{tt('freight')}: <span className="font-mono text-brand-text">{formatINR(track.freight_charges)}</span></span>
                <span>{tt('ewayBill')}: <span className="font-mono text-brand-text">{track.eway_bill_no || '—'}</span></span>
              </div>
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
            {[...mockVehicles]
              .sort((a, b) => Number(b.is_available) - Number(a.is_available))
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_no} — {v.is_available ? tv('available') : tv('inUse')}
                </option>
              ))}
          </FormInput>
          <FormInput as="select" label={`${tt('route')} — ${tc('from')}`} value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={`${tt('route')} — ${tc('to')}`} value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })}>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>
          <FormInput as="select" label={tt('driver')} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
            <option value="">—</option>
            {mockDrivers.map((dr) => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
          </FormInput>
          <FormInput as="textarea" label={tt('originAddress')} className="sm:col-span-2" placeholder={tt('pickupAddressPlaceholder')} value={form.origin_address} onChange={(e) => setForm({ ...form, origin_address: e.target.value })} />
          <FormInput as="textarea" label={tt('destinationAddress')} className="sm:col-span-2" placeholder={tt('deliveryAddressPlaceholder')} value={form.destination_address} onChange={(e) => setForm({ ...form, destination_address: e.target.value })} />
          <FormInput label={tt('cargo')} placeholder={tt('cargoPlaceholder')} value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })} />
          <FormInput label={tt('cargoWeight')} type="number" placeholder="14500" value={form.cargo_weight_kg} onChange={(e) => setForm({ ...form, cargo_weight_kg: e.target.value })} />
          <FormInput label={tt('cargoValue')} type="number" placeholder="2400000" value={form.cargo_value} onChange={(e) => setForm({ ...form, cargo_value: e.target.value })} />
          <FormInput label={tt('freight')} type="number" placeholder="48000" value={form.freight_charges} onChange={(e) => setForm({ ...form, freight_charges: e.target.value })} />
          <DatePicker label={tt('plannedDeparture')} value={form.planned_departure} onChange={(v) => setForm({ ...form, planned_departure: v })} />
          <FormInput label={tt('ewayBill')} placeholder="EWB-310024889" value={form.eway_bill_no} onChange={(e) => setForm({ ...form, eway_bill_no: e.target.value })} />
          <DatePicker label={tt('ewayBillExpiry')} value={form.eway_bill_expiry} onChange={(v) => setForm({ ...form, eway_bill_expiry: v })} />
          <FormInput as="textarea" label={tt('notes')} className="sm:col-span-2" placeholder={tt('notesPlaceholder')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Drawer>
    </div>
  );
}
