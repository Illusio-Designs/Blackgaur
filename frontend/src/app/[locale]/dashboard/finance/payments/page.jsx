'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Banknote, Plus } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Tabs from '@/components/ui/Tabs';
import Drawer from '@/components/ui/Drawer';
import Select from '@/components/ui/Select';
import FormInput from '@/components/ui/FormInput';
import DatePicker from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments, useTdsJournal, useRecordPayment } from '@/hooks/usePayments';
import { formatINR, formatDate } from '@/lib/utils';

const MODES = ['NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash'].map((m) => ({ value: m, label: m }));
const TDS_RATE = 2; // Sec 194C, deducted by the recipient on freight value

export default function PaymentsPage() {
  const t = useTranslations('payments');
  const tc = useTranslations('common');
  const ti = useTranslations('invoices');
  const toast = useToast();

  const [tab, setTab] = useState('payments');
  const [open, setOpen] = useState(false);

  const { data: paymentsData } = usePayments();
  const { data: journalData } = useTdsJournal();
  const { data: invoicesData } = useInvoices();
  const recordPayment = useRecordPayment();
  const payments = paymentsData?.data ?? [];
  const journal = journalData?.data ?? [];
  const invoices = useMemo(() => invoicesData?.data ?? [], [invoicesData]);

  const EMPTY = { invoice_id: '', date: '', mode: 'NEFT', reference: '', tds_deducted: '' };
  const [form, setForm] = useState(EMPTY);

  const selectedInv = useMemo(
    () => invoices.find((i) => String(i.id) === String(form.invoice_id)),
    [invoices, form.invoice_id],
  );
  const gross = Number(selectedInv?.total_amount || 0);
  const tds = form.tds_deducted === '' ? Math.round((Number(selectedInv?.freight_amount || selectedInv?.subtotal || 0) * TDS_RATE) / 100) : Number(form.tds_deducted);
  const received = Math.max(0, gross - tds);

  const onPickInvoice = (id) => {
    const inv = invoices.find((i) => String(i.id) === String(id));
    const defTds = Math.round((Number(inv?.freight_amount || inv?.subtotal || 0) * TDS_RATE) / 100);
    setForm((f) => ({ ...f, invoice_id: id, tds_deducted: String(defTds) }));
  };

  const submit = async () => {
    if (!selectedInv) return;
    try {
      await recordPayment.mutateAsync({
        invoice_id: selectedInv.id,
        date: form.date || undefined,
        mode: form.mode,
        reference: form.reference,
        tds_deducted: tds,
      });
      setOpen(false);
      setForm(EMPTY);
      toast.success(t('saved'), `${selectedInv.invoice_number} · ${formatINR(received)}`);
    } catch (err) {
      toast.error(tc('error') , err?.response?.data?.error?.message || String(err));
    }
  };

  const payCols = useMemo(() => [
    { accessorKey: 'invoice_number', header: t('invoice'), cell: ({ row }) => <span className="font-mono text-sm font-medium text-brand-navy">{row.original.invoice_number}</span> },
    { id: 'client', header: ti('client'), accessorFn: (r) => r.client?.company_name, cell: ({ row }) => row.original.client?.company_name },
    { accessorKey: 'gross', header: t('gross'), cell: ({ row }) => <span className="font-mono">{formatINR(row.original.gross)}</span> },
    { accessorKey: 'tds_deducted', header: t('tdsDeducted'), cell: ({ row }) => <span className="font-mono text-brand-danger">−{formatINR(row.original.tds_deducted)}</span> },
    { accessorKey: 'amount_received', header: t('received'), cell: ({ row }) => <span className="font-mono font-semibold text-brand-success">{formatINR(row.original.amount_received)}</span> },
    { accessorKey: 'mode', header: t('mode'), cell: ({ row }) => <span>{row.original.mode} · <span className="font-mono text-xs text-brand-muted">{row.original.reference}</span></span> },
    { accessorKey: 'date', header: t('date'), cell: ({ row }) => formatDate(row.original.date) },
  ], [t, ti]);

  const jCols = useMemo(() => [
    { accessorKey: 'date', header: t('date'), cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: 'invoice_number', header: t('invoice'), cell: ({ row }) => <span className="font-mono text-sm text-brand-navy">{row.original.invoice_number}</span> },
    { id: 'client', header: ti('client'), accessorFn: (r) => r.client?.company_name, cell: ({ row }) => row.original.client?.company_name },
    { accessorKey: 'section', header: t('section'), cell: ({ row }) => <span className="rounded bg-brand-surface px-2 py-0.5 font-mono text-xs">{row.original.section}</span> },
    { accessorKey: 'tds_amount', header: t('tdsAmount'), cell: ({ row }) => <span className="font-mono font-medium text-brand-navy">{formatINR(row.original.tds_amount)}</span> },
    { accessorKey: 'narration', header: t('narration'), enableSorting: false, cell: ({ row }) => <span className="text-xs text-brand-muted">{row.original.narration}</span> },
  ], [t, ti]);

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={Banknote}
        accent="text-brand-success"
        actions={<Button variant="amber" icon={Plus} onClick={() => setOpen(true)}>{t('recordPayment')}</Button>}
      />

      <div className="mb-4">
        <Tabs
          tabs={[{ value: 'payments', label: t('paymentsTab') }, { value: 'tds', label: t('tdsTab') }]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'payments' ? (
        <DataTable columns={payCols} data={payments} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />
      ) : (
        <DataTable columns={jCols} data={journal} pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }} />
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t('recordPayment')}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>{tc('cancel')}</Button>
            <Button variant="amber" disabled={!selectedInv} onClick={submit}>{tc('save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label={t('invoice')}
            value={form.invoice_id}
            onChange={onPickInvoice}
            placeholder={t('invoice')}
            options={invoices.map((i) => ({ value: String(i.id), label: `${i.invoice_number} · ${i.client?.company_name} · ${formatINR(i.total_amount)}` }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <DatePicker label={t('date')} value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <Select label={t('mode')} value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} options={MODES} />
          </div>
          <FormInput label={t('reference')} placeholder={t('referencePlaceholder')} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <FormInput label={`${t('tdsDeducted')} (194C)`} type="number" value={form.tds_deducted} onChange={(e) => setForm({ ...form, tds_deducted: e.target.value })} />

          {/* Computed summary */}
          <div className="rounded-xl border border-brand-border bg-brand-surface/50 p-3.5 text-sm">
            <div className="flex justify-between"><span className="text-brand-muted">{t('gross')}</span><span className="font-mono">{formatINR(gross)}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">{t('tdsDeducted')}</span><span className="font-mono text-brand-danger">−{formatINR(tds)}</span></div>
            <div className="mt-2 flex justify-between border-t border-brand-border pt-2 font-semibold text-brand-navy"><span>{t('received')}</span><span className="font-mono text-brand-success">{formatINR(received)}</span></div>
            {tds > 0 && <p className="mt-2 text-xs text-brand-muted">{t('autoJournalNote')}</p>}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
