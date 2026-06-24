'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { History, Download, Search } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import AuditDiff from '@/components/ui/AuditDiff';
import { useAuditLogs } from '@/hooks/useAudit';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const t = useTranslations('audit');
  const tc = useTranslations('common');
  const tr = useTranslations('roles');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { data: auditData } = useAuditLogs({ limit: 100 });

  const rows = useMemo(
    () =>
      (auditData?.data ?? []).filter(
        (l) =>
          !search ||
          l.action?.toLowerCase().includes(search.toLowerCase()) ||
          l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
          l.resource_label?.toLowerCase().includes(search.toLowerCase()),
      ),
    [auditData, search],
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'created_at', header: t('timestamp'), cell: ({ row }) => <span className="whitespace-nowrap text-brand-muted">{formatDate(row.original.created_at, { withTime: true })}</span> },
      { accessorKey: 'user_name', header: t('user'), cell: ({ row }) => (<div><p className="font-medium text-brand-navy">{row.original.user_name}</p><p className="text-xs text-brand-muted">{tr(row.original.user_role)}</p></div>) },
      { accessorKey: 'action', header: t('action'), cell: ({ row }) => (<span className="inline-flex items-center gap-2"><span className="font-mono text-xs text-brand-blue">{row.original.action}</span>{row.original.api && <span className="rounded bg-brand-fastag/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-fastag">{t('apiEvent')}</span>}</span>) },
      { accessorKey: 'resource_type', header: t('resource'), cell: ({ row }) => <span className="text-brand-text">{row.original.resource_type}</span> },
      { accessorKey: 'resource_label', header: t('label'), cell: ({ row }) => <span className="font-mono text-xs">{row.original.resource_label}</span> },
    ],
    [t, tr],
  );

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={History} accent="text-brand-blue"
        actions={<Button variant="outline" icon={Download}>{tc('exportCsv')}</Button>} />

      <div className="mb-4 max-w-xs">
        <FormInput icon={Search} placeholder={`${tc('search')}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="cursor-pointer [&_tbody_tr]:cursor-pointer" onClick={(e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const idx = [...tr.parentNode.children].indexOf(tr);
        if (rows[idx]) setSelected(rows[idx]);
      }}>
        <DataTable columns={columns} data={rows} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.action || ''} — ${selected?.resource_label || ''}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-brand-muted">{t('user')}</p><p className="font-medium text-brand-navy">{selected.user_name}</p></div>
              <div><p className="text-xs text-brand-muted">{t('timestamp')}</p><p className="font-medium text-brand-navy">{formatDate(selected.created_at, { withTime: true })}</p></div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">{t('beforeAfter')}</p>
              <AuditDiff before={selected.before_state} after={selected.after_state} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
