'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ReceiptText, CheckCheck, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import ExpenseRow from '@/components/ui/ExpenseRow';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useExpenses, useApproveExpense, useRejectExpense } from '@/hooks/useExpenses';
import { EXPENSE_STATUSES } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import { stagger, staggerItem } from '@/lib/animations';

export default function ExpensesPage() {
  const t = useTranslations('expenses');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data, isLoading } = useExpenses();
  const approve = useApproveExpense();
  const reject = useRejectExpense();

  const [local, setLocal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = useMemo(() => local ?? data?.data ?? [], [local, data]);
  const filtered = useMemo(
    () => rows.filter((e) => statusFilter === 'all' || e.status === statusFilter),
    [rows, statusFilter],
  );

  const pendingTotal = rows
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = rows.filter((e) => e.status === 'pending').length;

  const updateRow = (id, patch) => setLocal(rows.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const handleApprove = (exp) => {
    updateRow(exp.id, { status: 'approved' });
    approve.mutate({ id: exp.id });
    toast.success(t('approved'), `${exp.expense_type} ${formatINR(exp.amount)}`);
  };
  const handleReject = (exp, reason) => {
    updateRow(exp.id, { status: 'rejected', rejected_reason: reason });
    reject.mutate({ id: exp.id, reason });
    toast.error(t('rejected'), reason);
  };
  const bulkApprove = () => {
    const pend = rows.filter((e) => e.status === 'pending');
    setLocal(rows.map((e) => (e.status === 'pending' ? { ...e, status: 'approved' } : e)));
    pend.forEach((e) => approve.mutate({ id: e.id }));
    toast.success(t('approved'), `${pend.length} expenses`);
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={ReceiptText}
        accent="text-brand-amber"
        actions={
          <Button variant="success" icon={CheckCheck} onClick={bulkApprove} disabled={!pendingCount}>
            {t('bulkApprove')} ({pendingCount})
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-brand-muted">{t('approvalQueue')}</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-amber">{pendingCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-brand-muted">Pending {tc('amount')}</p>
          <p className="mt-1 font-mono text-2xl font-bold text-brand-navy">{formatINR(pendingTotal)}</p>
        </div>
        <div className="card col-span-2 flex items-center gap-2 p-4">
          <Filter className="h-4 w-4 text-brand-muted" />
          <div className="flex flex-wrap gap-1.5">
            {['all', ...EXPENSE_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition ${statusFilter === s ? 'bg-brand-navy text-white' : 'bg-brand-surface text-brand-muted hover:bg-brand-border'}`}
              >
                {s === 'all' ? tc('all') : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-xl" rounded />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {filtered.map((exp) => (
            <motion.div key={exp.id} variants={staggerItem}>
              <ExpenseRow
                expense={exp}
                onApprove={() => handleApprove(exp)}
                onReject={(reason) => handleReject(exp, reason)}
              />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="card">
              <EmptyState icon={ReceiptText} title={tc('noData')} subtitle={t('subtitle')} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
