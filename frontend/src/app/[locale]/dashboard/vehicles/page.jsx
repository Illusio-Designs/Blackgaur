'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Plus, Truck, CircleCheck, FileWarning, Radio, MapPin, Pencil } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import DatePicker from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { useVehicles, useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTrackingProviders } from '@/hooks/useTracking';
import { VEHICLE_TYPES, OWNER_TYPES, GPS_PROVIDERS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';

// Days until a date (negative = already expired).
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d - new Date()) / 86400000);
}

function DocChip({ label, date }) {
  const days = daysUntil(date);
  const expired = days != null && days < 0;
  const soon = days != null && days >= 0 && days <= 30;
  return (
    <span
      title={date ? formatDate(date) : '—'}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
        expired
          ? 'bg-red-50 text-brand-danger'
          : soon
            ? 'bg-amber-50 text-brand-amber'
            : 'bg-brand-surface text-brand-muted',
      )}
    >
      <span className="font-semibold">{label}</span>
      <span className="font-mono">{date ? formatDate(date, { short: true }) : '—'}</span>
    </span>
  );
}

const EMPTY = {
  registration_no: '', vehicle_type: 'Truck', capacity_tons: '', model: '', owner_type: 'own',
  driver_name: '', rc_expiry: '', insurance_expiry: '', fitness_expiry: '', permit_expiry: '',
  fastag_tag_id: '', gps_device_id: '', gps_provider: '', is_available: true,
};

export default function VehiclesPage() {
  const t = useTranslations('vehicles');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data, isLoading } = useVehicles();
  const mockDrivers = useDrivers().data?.data ?? [];
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const providerRows = useTrackingProviders().data?.data;
  const gpsProviders = providerRows?.length
    ? [{ key: '', label: 'None' }, ...providerRows]
    : GPS_PROVIDERS;

  const [local, setLocal] = useState(null);
  const [owner, setOwner] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDrawerOpen(true); };
  const openEdit = (v) => { setEditingId(v.id); setForm({ ...EMPTY, ...v }); setDrawerOpen(true); };

  const rows = useMemo(() => local ?? data?.data ?? [], [local, data]);
  const filtered = useMemo(
    () => (owner === 'all' ? rows : rows.filter((v) => v.owner_type === owner)),
    [rows, owner],
  );

  const stats = useMemo(() => {
    const docExpiring = rows.filter((v) =>
      [v.rc_expiry, v.insurance_expiry, v.fitness_expiry, v.permit_expiry].some((d) => {
        const days = daysUntil(d);
        return days != null && days <= 30;
      }),
    ).length;
    return {
      total: rows.length,
      available: rows.filter((v) => v.is_available).length,
      own: rows.filter((v) => v.owner_type === 'own').length,
      docExpiring,
    };
  }, [rows]);

  const ownerTabs = [
    { value: 'all', label: `${t('all')} (${rows.length})` },
    ...OWNER_TYPES.map((o) => ({ value: o, label: `${t(o)} (${rows.filter((v) => v.owner_type === o).length})` })),
  ];

  const submitVehicle = () => {
    const payload = { ...form, capacity_tons: Number(form.capacity_tons) || 0 };
    if (editingId) {
      setLocal(rows.map((v) => (v.id === editingId ? { ...v, ...payload } : v)));
      updateVehicle.mutate({ id: editingId, ...payload });
      toast.success(t('saveChanges'), payload.registration_no);
    } else {
      const newVehicle = { id: Date.now(), ...payload };
      setLocal([newVehicle, ...rows]);
      createVehicle.mutate(newVehicle);
      toast.success(t('addVehicle'), newVehicle.registration_no);
    }
    setDrawerOpen(false);
    setForm(EMPTY);
    setEditingId(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'registration_no',
        header: t('registration'),
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-semibold text-brand-navy">{row.original.registration_no}</p>
            <p className="text-xs text-brand-muted">{row.original.vehicle_type} · {row.original.model}</p>
          </div>
        ),
      },
      {
        id: 'owner',
        header: t('owner'),
        accessorFn: (r) => r.owner_type,
        cell: ({ row }) => {
          const o = row.original.owner_type;
          const styles = {
            own: 'bg-blue-50 text-brand-blue',
            attached: 'bg-teal-50 text-brand-fastag',
            market: 'bg-orange-50 text-brand-fuel',
          };
          return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold', styles[o])}>{t(o)}</span>;
        },
      },
      { accessorKey: 'capacity_tons', header: t('capacity'), cell: ({ row }) => <span className="font-mono text-brand-text">{row.original.capacity_tons}</span> },
      { id: 'driver', header: t('driver'), accessorFn: (r) => r.driver_name, cell: ({ row }) => row.original.driver_name || <span className="text-brand-muted">{t('unassigned')}</span> },
      {
        id: 'documents',
        header: t('documents'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <DocChip label={t('rc')} date={row.original.rc_expiry} />
            <DocChip label={t('insurance')} date={row.original.insurance_expiry} />
            <DocChip label={t('fitness')} date={row.original.fitness_expiry} />
            <DocChip label={t('permit')} date={row.original.permit_expiry} />
          </div>
        ),
      },
      {
        accessorKey: 'is_available',
        header: t('availability'),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.is_available ? 'active' : 'inactive'}
            label={row.original.is_available ? t('available') : t('inUse')}
          />
        ),
      },
      {
        id: 'gps',
        header: t('gps'),
        enableSorting: false,
        cell: ({ row }) => (row.original.gps_device_id
          ? <span className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-blue"><MapPin className="h-3.5 w-3.5" />{row.original.gps_device_id}</span>
          : <span className="text-xs text-brand-muted/70">{t('noGps')}</span>),
      },
      {
        id: 'devices',
        header: tc('actions'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 text-brand-muted">
            {row.original.fastag_tag_id && <Radio className="h-4 w-4 text-brand-fastag" title="FASTag" />}
            {row.original.gps_device_id && <MapPin className="h-4 w-4 text-brand-blue" title={t('gps')} />}
            <Button size="sm" variant="outline" icon={Pencil} onClick={() => openEdit(row.original)}>
              {t('manage')}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tc],
  );

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={Container}
        actions={<Button variant="amber" icon={Plus} onClick={openCreate}>{t('addVehicle')}</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label={t('totalFleet')} value={stats.total} icon={Truck} loading={isLoading} format={(v) => Math.round(v)} />
        <KPICard label={t('available')} value={stats.available} icon={CircleCheck} accent="text-brand-success" loading={isLoading} format={(v) => Math.round(v)} />
        <KPICard label={t('own')} value={stats.own} icon={Container} accent="text-brand-blue" loading={isLoading} format={(v) => Math.round(v)} />
        <KPICard label={t('docsExpiring')} value={stats.docExpiring} icon={FileWarning} accent="text-brand-amber" loading={isLoading} format={(v) => Math.round(v)} />
      </div>

      <div className="mb-4">
        <Tabs tabs={ownerTabs} value={owner} onChange={setOwner} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? `${t('manage')} — ${form.registration_no}` : t('addVehicle')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>{tc('cancel')}</Button>
            <Button variant="amber" onClick={submitVehicle} loading={createVehicle.isPending}>
              {editingId ? t('saveChanges') : tc('create')}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">{t('details')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label={t('registration')} placeholder="GJ-01-AB-1234" value={form.registration_no} onChange={(e) => setForm({ ...form, registration_no: e.target.value.toUpperCase() })} />
          <FormInput label={t('model')} placeholder="Tata Signa 4825" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <Select label={t('type')} value={form.vehicle_type} onChange={(v) => setForm({ ...form, vehicle_type: v })} options={VEHICLE_TYPES.map((x) => ({ value: x, label: x }))} />
          <FormInput label={t('capacity')} type="number" placeholder="16" value={form.capacity_tons} onChange={(e) => setForm({ ...form, capacity_tons: e.target.value })} />
          <Select label={t('owner')} value={form.owner_type} onChange={(v) => setForm({ ...form, owner_type: v })} options={OWNER_TYPES.map((o) => ({ value: o, label: t(o) }))} />
          <Select label={t('driver')} value={form.driver_name} onChange={(v) => setForm({ ...form, driver_name: v })} options={[{ value: '', label: t('unassigned') }, ...mockDrivers.map((d) => ({ value: d.name, label: d.name }))]} />
        </div>

        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-brand-muted">{t('renewals')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker label={t('rc')} value={form.rc_expiry} onChange={(v) => setForm({ ...form, rc_expiry: v })} />
          <DatePicker label={t('insurance')} value={form.insurance_expiry} onChange={(v) => setForm({ ...form, insurance_expiry: v })} />
          <DatePicker label={t('fitness')} value={form.fitness_expiry} onChange={(v) => setForm({ ...form, fitness_expiry: v })} />
          <DatePicker label={t('permit')} value={form.permit_expiry} onChange={(v) => setForm({ ...form, permit_expiry: v })} />
          <FormInput as="select" label={t('gpsProvider')} value={form.gps_provider || ''} onChange={(e) => setForm({ ...form, gps_provider: e.target.value })}>
            {gpsProviders.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </FormInput>
          <FormInput label={`${t('gps')} ID`} placeholder="IMEI / device id" value={form.gps_device_id} onChange={(e) => setForm({ ...form, gps_device_id: e.target.value })} />
          <FormInput label="FASTag ID" placeholder="34161FA8…" value={form.fastag_tag_id} onChange={(e) => setForm({ ...form, fastag_tag_id: e.target.value })} />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface/50 p-3.5">
          <div>
            <p className="text-sm font-medium text-brand-navy">{t('availability')}</p>
            <p className="text-xs text-brand-muted">{form.is_available ? t('available') : t('inUse')}</p>
          </div>
          <Switch checked={form.is_available} onChange={(v) => setForm({ ...form, is_available: v })} />
        </div>
      </Drawer>
    </div>
  );
}
