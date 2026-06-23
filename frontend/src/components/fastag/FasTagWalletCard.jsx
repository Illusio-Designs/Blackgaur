'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Radio, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
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
      className={cn('card overflow-hidden p-0', isLow && 'ring-1 ring-brand-danger/40')}
    >
      {/* ── NETC tag face ── */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-brand-fastag to-[#0a4f49] p-4 text-white">
        {/* RFID wave motif */}
        <div className="pointer-events-none absolute -right-6 -top-6 opacity-20">
          <Radio className="h-28 w-28" strokeWidth={1} />
        </div>

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
              <Radio className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-wide">FASTag</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/70">NETC</p>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
            {wallet.tag_issuer}
          </span>
        </div>

        <p className="relative mt-3 font-mono text-xs tracking-wider text-white/80">
          {mask(wallet.tag_id, 6)}
        </p>

        <div className="relative mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/60">{tc('vehicle')}</p>
            <p className="font-mono text-sm font-semibold">{wallet.vehicle?.registration_no}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-white/60">{t('balance')}</p>
            <p className={cn('font-mono text-xl font-bold', isLow ? 'text-amber-300' : 'text-white')}>
              {formatINR(wallet.balance)}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-3 rounded-full bg-emerald-400/90 px-2 py-0.5 text-[11px] font-medium text-emerald-950"
            >
              {t('synced')}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-brand-muted">{t('lastSynced', { time: timeAgo(wallet.balance_synced_at) })}</p>
          {isLow && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-brand-danger">
              <AlertTriangle className="h-3 w-3" />
              {t('low_balance')}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="flex-1">
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
            {isSyncing ? t('syncing') : tc('sync_now')}
          </Button>
          <Button variant="navy" size="sm" onClick={() => setRechargeOpen(true)} className="flex-1">
            {t('recharge')}
          </Button>
        </div>
      </div>

      <Drawer
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
      </Drawer>
    </motion.div>
  );
}
