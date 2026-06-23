'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Plus, Send, Check, Eye } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import RCMBadge from '@/components/ui/RCMBadge';
import Modal from '@/components/ui/Modal';
import InvoiceForm from '@/components/ui/InvoiceForm';
import { useToast } from '@/components/ui/Toast';
import { useInvoices, useApproveInvoice, useSendInvoice, useCreateInvoice } from '@/hooks/useInvoices';
import { useBranding } from '@/hooks/useBranding';
import { formatINR, formatDate } from '@/lib/utils';
import { amountInWords } from '@/lib/gst';

export default function InvoicesPage() {
  const t = useTranslations('invoices');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data } = useInvoices();
  const { branding } = useBranding();
  const approve = useApproveInvoice();
  const send = useSendInvoice();
  const create = useCreateInvoice();

  const [local, setLocal] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const rows = local ?? data?.data ?? [];
  const updateRow = (id, patch) => setLocal(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleApprove = (inv) => {
    updateRow(inv.id, { status: 'approved' });
    approve.mutate({ id: inv.id });
    toast.success(tc('approve'), inv.invoice_number);
  };
  const handleSend = (inv) => {
    updateRow(inv.id, { status: 'sent' });
    send.mutate({ id: inv.id });
    toast.success(t('sent', { client: inv.client?.company_name }), inv.invoice_number);
  };
  const handleCreate = (values) => {
    const newInv = {
      id: Date.now(),
      invoice_number: `INV-2024-25-${String(rows.length + 1).padStart(4, '0')}`,
      invoice_type: 'outward',
      client: values.client || rows[0]?.client,
      freight_amount: Number(values.freight_amount) || 0,
      subtotal: values.subtotal ?? 0,
      is_rcm: !!values.is_rcm,
      igst_amount: values.igst_amount ?? 0,
      cgst_amount: values.cgst_amount ?? 0,
      sgst_amount: values.sgst_amount ?? 0,
      tds_amount: values.tds_amount ?? 0,
      total_amount: values.total_amount ?? 0,
      status: 'draft',
      due_date: values.due_date || '2026-07-31',
    };
    setLocal([newInv, ...rows]);
    create.mutate(newInv);
    setCreateOpen(false);
    toast.success(tc('create'), newInv.invoice_number);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'invoice_number',
        header: t('invoiceNumber'),
        cell: ({ row }) => <span className="font-mono text-sm font-medium text-brand-navy">{row.original.invoice_number}</span>,
      },
      {
        id: 'client',
        header: t('client'),
        accessorFn: (r) => r.client?.company_name,
        cell: ({ row }) => <span className="text-brand-text">{row.original.client?.company_name}</span>,
      },
      {
        accessorKey: 'is_rcm',
        header: t('rcm_notice'),
        enableSorting: false,
        cell: ({ row }) => <RCMBadge isRcm={row.original.is_rcm} />,
      },
      {
        accessorKey: 'total_amount',
        header: t('totalAmount'),
        cell: ({ row }) => <span className="font-mono font-medium text-brand-navy">{formatINR(row.original.total_amount, { decimals: 2 })}</span>,
      },
      {
        accessorKey: 'due_date',
        header: t('dueDate'),
        cell: ({ row }) => formatDate(row.original.due_date),
      },
      {
        accessorKey: 'status',
        header: tc('status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} label={t(`status.${row.original.status}`)} pulse={row.original.status === 'overdue'} />,
      },
      {
        id: 'actions',
        header: tc('actions'),
        enableSorting: false,
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" icon={Eye} onClick={() => setPreview(inv)} aria-label={t('previewPdf')} />
              {inv.status === 'pending_approval' && (
                <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(inv)}>{tc('approve')}</Button>
              )}
              {(inv.status === 'approved' || inv.status === 'draft') && (
                <Button size="sm" variant="primary" icon={Send} onClick={() => handleSend(inv)}>{t('send')}</Button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={FileText}
        actions={<Button variant="amber" icon={Plus} onClick={() => setCreateOpen(true)}>{t('createInvoice')}</Button>}
      />

      <DataTable
        columns={columns}
        data={rows}
        pagination={{ page: 1, totalPages: 1, hasNext: false, hasPrev: false }}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('createInvoice')} size="xl">
        <InvoiceForm mode="create" onSubmit={handleCreate} />
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={`${t('previewPdf')} — ${preview?.invoice_number || ''}`} size="lg">
        {preview && (
          <div className="space-y-4 font-body text-sm">
            <div className="flex items-start justify-between border-b border-brand-border pb-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-amber font-display text-lg font-bold text-white">
                  {(branding.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <p className="mt-2 font-display font-bold text-brand-navy">
                  {branding.legalName || branding.companyName}
                </p>
                <p className="text-xs text-brand-muted">
                  GSTIN: {branding.contact.gstin} · {branding.contact.city}, {branding.contact.state}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-brand-navy">{preview.invoice_number}</p>
                <p className="text-xs text-brand-muted">{formatDate(preview.due_date)}</p>
                <div className="mt-1"><RCMBadge isRcm={preview.is_rcm} /></div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">Bill To</p>
              <p className="font-medium text-brand-navy">{preview.client?.company_name}</p>
              <p className="text-xs text-brand-muted">{preview.client?.gstin} · {preview.client?.billing_address}</p>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-brand-border">
                <tr><td className="py-2 text-brand-muted">{t('freight')}</td><td className="py-2 text-right font-mono">{formatINR(preview.freight_amount, { decimals: 2 })}</td></tr>
                <tr><td className="py-2 text-brand-muted">{t('subtotal')}</td><td className="py-2 text-right font-mono">{formatINR(preview.subtotal, { decimals: 2 })}</td></tr>
                {preview.is_rcm ? (
                  <tr><td className="py-2 text-brand-amber" colSpan={2}>{t('rcm_yes')}</td></tr>
                ) : (
                  <>
                    {preview.igst_amount > 0 && <tr><td className="py-2 text-brand-muted">{t('igst')}</td><td className="py-2 text-right font-mono">{formatINR(preview.igst_amount, { decimals: 2 })}</td></tr>}
                    {preview.cgst_amount > 0 && <tr><td className="py-2 text-brand-muted">{t('cgst')}</td><td className="py-2 text-right font-mono">{formatINR(preview.cgst_amount, { decimals: 2 })}</td></tr>}
                    {preview.sgst_amount > 0 && <tr><td className="py-2 text-brand-muted">{t('sgst')}</td><td className="py-2 text-right font-mono">{formatINR(preview.sgst_amount, { decimals: 2 })}</td></tr>}
                  </>
                )}
                {preview.tds_amount > 0 && <tr><td className="py-2 text-brand-muted">{t('tds')} (194C)</td><td className="py-2 text-right font-mono text-brand-danger">- {formatINR(preview.tds_amount, { decimals: 2 })}</td></tr>}
                <tr className="font-semibold text-brand-navy"><td className="py-2.5">{t('totalAmount')}</td><td className="py-2.5 text-right font-mono text-base">{formatINR(preview.total_amount, { decimals: 2 })}</td></tr>
              </tbody>
            </table>
            <p className="rounded-lg bg-brand-surface p-3 text-xs italic text-brand-muted">
              {t('inWords')}: {amountInWords(preview.total_amount)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
