'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Radio, AlertTriangle, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import { formatINR, timeAgo, mask, cn } from '@/lib/utils';

export default function FasTagWalletCard({ wallet, onSync, onRecharge }) {
  const t = useTranslations('fastag');
  const tc = useTranslations('common');
  const [isSyncing, setIsSyncing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [amount, setAmount] = useState('');

  if (!wallet) return null;

  const isLow = wallet.balance < wallet.low_balance_alert;

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await onSync?.(wallet);
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    } finally {
      setIsSyncing(false);
    }
  };

  const submitRecharge = () => {
    const val = Number(amount) || 0;
    if (val <= 0) return;
    onRecharge?.(wallet, val);
    setRechargeOpen(false);
    setAmount('');
  };

  return (
    <motion.div
      animate={flash ? { boxShadow: '0 0 0 3px rgba(13,148,136,0.45)' } : { boxShadow: '0 0 0 0 rgba(13,148,136,0)' }}
      transition={{ duration: 0.5 }}
      className={cn(
        'card relative overflow-hidden border-l-4 border-l-brand-fastag p-4',
        isLow && 'ring-1 ring-brand-danger/30',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-brand-navy">{wallet.vehicle?.registration_no}</p>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-brand-muted">
            <Radio className="h-3 w-3" />
            {mask(wallet.tag_id, 6)}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-brand-fastag">
          {wallet.tag_issuer}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-brand-muted">
            <Wallet className="h-3 w-3" />
            {t('balance')}
          </p>
          <p className={cn('font-mono text-2xl font-bold', isLow ? 'text-brand-danger' : 'text-brand-navy')}>
            {formatINR(wallet.balance)}
          </p>
        </div>
        {isLow && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-brand-danger">
            <AlertTriangle className="h-3 w-3" />
            {t('low_balance')}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-brand-muted">{t('lastSynced', { time: timeAgo(wallet.balance_synced_at) })}</p>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="flex-1">
          <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
          {isSyncing ? t('syncing') : tc('sync_now')}
        </Button>
        <Button variant="navy" size="sm" onClick={() => setRechargeOpen(true)} className="flex-1">
          {t('recharge')}
        </Button>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 top-3 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-brand-success"
          >
            {t('synced')}
          </motion.span>
        )}
      </AnimatePresence>

      <Modal
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        title={`${t('recharge')} — ${wallet.vehicle?.registration_no}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRechargeOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="navy" size="sm" disabled={!(Number(amount) > 0)} onClick={submitRecharge}>
              {t('recharge')}
            </Button>
          </>
        }
      >
        <FormInput
          type="number"
          min="0"
          label={t('rechargeAmount')}
          name="recharge_amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
      </Modal>
    </motion.div>
  );
}
