'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart3, Download } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import DateRangePicker from '@/components/ui/DateRangePicker';
import Skeleton from '@/components/ui/Skeleton';
import { useDashboardReport } from '@/hooks/useReports';
import { useClients } from '@/hooks/useClients';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

const TAB_KEYS = ['trip', 'finance', 'fastag', 'fuel', 'client'];

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useTranslations('common');
  const { data, isLoading } = useDashboardReport();
  const [tab, setTab] = useState('finance');
  const [range, setRange] = useState({ from: '2026-01-01', to: '2026-06-30' });

  const tabs = TAB_KEYS.map((key) => ({ value: key, label: t(key) }));

  const mockRevenueSeries = data?.revenue_series ?? [];
  const mockTollByVehicle = data?.toll_by_vehicle ?? [];
  const mockFuelByVehicle = data?.fuel_by_vehicle ?? [];
  const clientsList = useClients().data?.data ?? [];

  const tripPnl = mockRevenueSeries.map((m) => ({ month: m.month, pnl: m.revenue - m.cost }));
  const clientRevenue = clientsList.map((c) => ({ name: (c.company_name || '').split(' ')[0], revenue: (c.outstanding || 0) + 200000 }));

  return (
    <div>
      <PageHeader
        title={t('title')} subtitle={t('subtitle')} icon={BarChart3}
        actions={<Button variant="outline" icon={Download}>{tc('exportCsv')}</Button>}
      />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <DateRangePicker
          from={range.from}
          to={range.to}
          fromLabel={t('fromDate')}
          toLabel={t('toDate')}
          onChange={setRange}
        />
      </div>

      {isLoading ? (
        <div className="card p-5">
          <Skeleton className="mb-4 h-5 w-64" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
      <motion.div key={tab} {...fadeUp} className="card p-5">
        {tab === 'finance' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('revenueVsCost')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(m) => (tc.has(`monthsShort.`) ? tc(`monthsShort.`) : m)} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Legend />
                  <Bar dataKey="revenue" name={t('revenue')} fill="#1A56DB" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="cost" name={t('cost')} fill="#D97706" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'trip' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('tripPnl')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tripPnl}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(m) => (tc.has(`monthsShort.`) ? tc(`monthsShort.`) : m)} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Line type="monotone" dataKey="pnl" name={t('netPnl')} stroke="#065F46" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'fastag' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('tollByVehicle')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTollByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="vehicle" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="toll" fill="#0F766E" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'fuel' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('spendLitres')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockFuelByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="vehicle" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="spend" fill="#9A3412" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'client' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('clientRevenue')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="revenue" fill="#1A56DB" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {data?._mock !== false && <p className="mt-4 text-xs text-brand-muted">{tc('demoMode')}</p>}
      </motion.div>
      )}
    </div>
  );
}
