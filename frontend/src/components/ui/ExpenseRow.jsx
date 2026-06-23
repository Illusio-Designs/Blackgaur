'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Receipt, Link2, Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { formatINR, formatDate, cn } from '@/lib/utils';

export default function ExpenseRow({ expense, onApprove, onReject }) {
  const t = useTranslations('expenses');
  const tc = useTranslations('common');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [fx, setFx] = useState(0);
  const [fxType, setFxType] = useState('approve');

  if (!expense) return null;

  const isPending = expense.status === 'pending';

  const handleApprove = () => {
    setFxType('approve');
    setFx((n) => n + 1);
    onApprove?.(expense);
  };

  const submitReject = () => {
    setFxType('reject');
    setFx((n) => n + 1);
    onReject?.(expense, reason);
    setRejectOpen(false);
    setReason('');
  };

  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
      {/* Type + receipt */}
      <div className="flex min-w-0 items-center gap-3 sm:w-48">
        {expense.receipt_url ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-brand-surface transition hover:ring-2 hover:ring-brand-blue/30"
            aria-label={t('receipt')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={expense.receipt_url} alt={t('receipt')} className="h-full w-full object-cover" />
          </button>
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-brand-border text-brand-muted"
            title={t('noReceipt')}
          >
            <Receipt className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold capitalize text-brand-navy">
            {t(`types.${expense.expense_type}`)}
          </p>
          <p className="truncate text-xs text-brand-muted">{expense.driver?.name}</p>
        </div>
      </div>

      {/* Description + LR */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-brand-text">{expense.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-1 font-mono text-brand-blue">
            <Link2 className="h-3 w-3" />
            {expense.lr_number}
          </span>
          <span>{formatDate(expense.expense_date)}</span>
          {expense.is_fastag_synced || expense.is_fuelcard_synced ? (
            <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-fastag">
              {t('autoSynced')}
            </span>
          ) : null}
        </div>
      </div>

      {/* Amount */}
      <div className="font-mono text-base font-semibold text-brand-navy sm:w-28 sm:text-right">
        {formatINR(expense.amount)}
      </div>

      {/* Status + actions */}
      <TaskCompleteFX type={fxType} trigger={fx} className="flex items-center gap-2 sm:w-56 sm:justify-end">
        {isPending ? (
          <>
            <Button size="sm" variant="success" icon={Check} onClick={handleApprove}>
              {tc('approve')}
            </Button>
            <Button size="sm" variant="danger" icon={X} onClick={() => setRejectOpen(true)}>
              {tc('reject')}
            </Button>
          </>
        ) : (
          <StatusBadge
            status={expense.status}
            label={t(`status.${expense.status}`)}
            className={cn(expense.status === 'rejected' && 'cursor-help')}
          />
        )}
      </TaskCompleteFX>

      {/* Receipt lightbox */}
      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} title={t('receipt')} size="lg">
        {expense.receipt_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={expense.receipt_url}
            alt={t('receipt')}
            className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
          />
        )}
      </Modal>

      {/* Reject reason prompt */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t('rejectReason')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="danger" size="sm" disabled={!reason.trim()} onClick={submitReject}>
              {tc('reject')}
            </Button>
          </>
        }
      >
        <FormInput
          as="textarea"
          label={t('rejectReason')}
          name="reject_reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('rejectReason')}
        />
      </Modal>
    </div>
  );
}
