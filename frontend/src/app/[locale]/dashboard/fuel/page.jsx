'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Fuel } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import FuelCardItem from '@/components/fuel/FuelCardItem';
import FuelTransactionRow from '@/components/ui/FuelTransactionRow';
import { useToast } from '@/components/ui/Toast';
import { useFuelCards, useFuelTransactions, useBlockFuelCard, useAssignFuelCard } from '@/hooks/useFuelCards';
import { mockFuelByVehicle, mockTrips, mockVehicles, mockDrivers } from '@/lib/mock';
import { formatINR } from '@/lib/utils';
import { stagger, staggerItem, fadeUp } from '@/lib/animations';

export default function FuelPage() {
  const t = useTranslations('fuel');
  const toast = useToast();
  const { data: cardsData } = useFuelCards();
  const { data: txnData } = useFuelTransactions();
  const block = useBlockFuelCard();
  const assign = useAssignFuelCard();

  const [cards, setCards] = useState(null);
  const list = cards ?? cardsData?.data ?? [];
  const txns = txnData?.data ?? [];

  const handleBlock = (card, { block: shouldBlock, reason }) => {
    setCards(list.map((c) => (c.id === card.id ? { ...c, is_active: !shouldBlock } : c)));
    block.mutate({ id: card.id, block: shouldBlock, reason });
    if (shouldBlock) toast.error(t('blocked'), reason);
    else toast.success(t('unblock'), card.card_number?.slice(-4));
  };
  const handleAssign = (card, { vehicle_id, driver_id }) => {
    const vehicle = mockVehicles.find((v) => v.id === Number(vehicle_id));
    const driver = mockDrivers.find((d) => d.id === Number(driver_id));
    setCards(list.map((c) => (c.id === card.id ? { ...c, vehicle, driver } : c)));
    assign.mutate({ id: card.id, vehicle_id, driver_id });
    toast.success(t('assign'), vehicle?.registration_no);
  };

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={Fuel} accent="text-brand-fuel" />

      <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('cards')}</h3>
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <motion.div key={c.id} variants={staggerItem}>
            <FuelCardItem card={c} onAssign={(vals) => handleAssign(c, vals)} onBlock={(vals) => handleBlock(c, vals)} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} className="card p-5 lg:col-span-2">
          <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('txnFeed')}</h3>
          <div className="space-y-2">
            {txns.map((txn) => (
              <FuelTransactionRow key={txn.id} txn={txn} trip={mockTrips.find((tr) => tr.id === txn.trip_id)} />
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="card p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-brand-navy">{t('mileageChart')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFuelByVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="vehicle" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="spend" name={t('monthlySpend')} fill="#9A3412" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="litres" name={t('litres')} fill="#D97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
