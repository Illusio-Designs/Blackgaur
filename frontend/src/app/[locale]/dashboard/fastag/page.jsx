'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import FasTagWalletCard from '@/components/fastag/FasTagWalletCard';
import TollTransactionRow from '@/components/ui/TollTransactionRow';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useFastagWallets, useTollTransactions, useSyncFastag, useRechargeFastag } from '@/hooks/useFastag';
import { mockTollByVehicle, mockTrips } from '@/lib/mock';
import { formatINR } from '@/lib/utils';
import { stagger, staggerItem, fadeUp } from '@/lib/animations';

export default function FastagPage() {
  const t = useTranslations('fastag');
  const tc = useTranslations('common');
  const toast = useToast();
  const { data: walletsData, isLoading } = useFastagWallets();
  const { data: txnData } = useTollTransactions();
  const sync = useSyncFastag();
  const recharge = useRechargeFastag();

  const [wallets, setWallets] = useState(null);
  const list = wallets ?? walletsData?.data ?? [];
  const txns = txnData?.data ?? [];
  const lowBalance = list.filter((w) => w.balance < w.low_balance_alert);

  const handleSync = async (wallet) => {
    await sync.mutateAsync({ id: wallet.id });
    const newBalance = wallet.balance + Math.floor(Math.random() * 2000 + 500);
    setWallets(list.map((w) => (w.id === wallet.id ? { ...w, balance: newBalance, balance_synced_at: new Date().toISOString() } : w)));
    toast.success(t('synced'), wallet.vehicle?.registration_no);
  };
  const handleRecharge = (wallet, amount) => {
    setWallets(list.map((w) => (w.id === wallet.id ? { ...w, balance: w.balance + Number(amount) } : w)));
    recharge.mutate({ id: wallet.id, amount });
    toast.success(t('recharge'), `${formatINR(amount)} · ${wallet.vehicle?.registration_no}`);
  };

  return (
    <div>
      <PageHeader
        title={t('title')} subtitle={t('subtitle')} icon={Radio} accent="text-brand-fastag"
        actions={<Button variant="outline" icon={RefreshCw} onClick={() => list.forEach(handleSync)}>{tc('sync_now')}</Button>}
      />

      {lowBalance.length > 0 && (
        <motion.div {...fadeUp} className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-danger/30 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-brand-danger" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-danger">{t('lowBalancePanel')}</p>
            <p className="text-xs text-brand-danger/80">
              {lowBalance.map((w) => `${w.vehicle?.registration_no} (${formatINR(w.balance)})`).join(' · ')}
            </p>
          </div>
        </motion.div>
      )}

      <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('wallets')}</h3>
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((w) => (
          <motion.div key={w.id} variants={staggerItem}>
            <FasTagWalletCard wallet={w} onSync={() => handleSync(w)} onRecharge={(amount) => handleRecharge(w, amount)} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} className="card p-5 lg:col-span-2">
          <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('tollFeed')}</h3>
          <div className="space-y-2">
            {txns.map((txn) => (
              <TollTransactionRow key={txn.id} txn={txn} trip={mockTrips.find((tr) => tr.id === txn.trip_id)} />
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="card p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('monthlyChart')}</h3>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTollByVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="vehicle" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="toll" fill="#0F766E" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
