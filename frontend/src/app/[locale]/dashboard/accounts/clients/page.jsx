'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Plus } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import RCMBadge from '@/components/ui/RCMBadge';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import { useToast } from '@/components/ui/Toast';
import { useClients, useCreateClient } from '@/hooks/useClients';
import { formatINR } from '@/lib/utils';

export default function ClientsPage() {
  const t = useTranslations('clients');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data } = useClients();
  const create = useCreateClient();

  const [local, setLocal] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company_name: '', gstin: '', contact_name: '', contact_mobile: '', credit_days: 30, rcm_applicable: true });

  const rows = local ?? data?.data ?? [];

  const submit = () => {
    const newClient = { ...form, id: Date.now(), credit_days: Number(form.credit_days), outstanding: 0 };
    setLocal([newClient, ...rows]);
    create.mutate(newClient);
    setOpen(false);
    setForm({ company_name: '', gstin: '', contact_name: '', contact_mobile: '', credit_days: 30, rcm_applicable: true });
    toast.success(tc('create'), newClient.company_name);
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'company_name', header: t('company'), cell: ({ row }) => <span className="font-medium text-brand-navy">{row.original.company_name}</span> },
      { accessorKey: 'gstin', header: t('gstin'), cell: ({ row }) => <span className="font-mono text-xs">{row.original.gstin}</span> },
      { id: 'contact', header: t('contact'), accessorFn: (r) => r.contact_name, cell: ({ row }) => (<div><p className="text-sm">{row.original.contact_name}</p><p className="font-mono text-xs text-brand-muted">{row.original.contact_mobile}</p></div>) },
      { accessorKey: 'credit_days', header: t('creditDays'), cell: ({ row }) => <span>{row.original.credit_days}d</span> },
      { accessorKey: 'rcm_applicable', header: t('rcm'), enableSorting: false, cell: ({ row }) => <RCMBadge isRcm={row.original.rcm_applicable} /> },
      { accessorKey: 'outstanding', header: t('outstanding'), cell: ({ row }) => <span className={`font-mono ${row.original.outstanding > 0 ? 'text-brand-danger' : 'text-brand-success'}`}>{formatINR(row.original.outstanding)}</span> },
    ],
    [t],
  );

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={Building2} actions={<Button variant="amber" icon={Plus} onClick={() => setOpen(true)}>{t('createClient')}</Button>} />
      <DataTable columns={columns} data={rows} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />

      <Modal open={open} onClose={() => setOpen(false)} title={t('createClient')} size="lg"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>{tc('cancel')}</Button><Button variant="amber" onClick={submit}>{tc('create')}</Button></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label={t('company')} className="sm:col-span-2" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <FormInput label={t('gstin')} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="24ABCDE1234F1Z5" />
          <FormInput label={t('creditDays')} type="number" value={form.credit_days} onChange={(e) => setForm({ ...form, credit_days: e.target.value })} />
          <FormInput label={t('contact')} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          <FormInput label="Mobile" value={form.contact_mobile} onChange={(e) => setForm({ ...form, contact_mobile: e.target.value })} />
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={form.rcm_applicable} onChange={(e) => setForm({ ...form, rcm_applicable: e.target.checked })} className="h-4 w-4 rounded border-brand-border text-brand-blue" />
            <span className="text-sm text-brand-text">{t('rcm')} applicable</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
