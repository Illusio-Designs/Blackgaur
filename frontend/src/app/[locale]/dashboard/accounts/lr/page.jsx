'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollText, Plus, MapPin } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Timeline from '@/components/ui/Timeline';
import { useTrips } from '@/hooks/useTrips';
import { formatINR } from '@/lib/utils';

const STEP_ORDER = ['planned', 'loading', 'in_transit', 'delivered'];

export default function LrBoardPage() {
  const t = useTranslations('lr');
  const tt = useTranslations('trips');
  const tc = useTranslations('common');
  const { data } = useTrips();
  const [track, setTrack] = useState(null);

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
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={ScrollText} actions={<Button variant="amber" icon={Plus}>{t('createLr')}</Button>} />
      <DataTable columns={columns} data={rows} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />

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
    </div>
  );
}
