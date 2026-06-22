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
import FormInput from '@/components/ui/FormInput';
import { useDashboardReport } from '@/hooks/useReports';
import { mockRevenueSeries, mockTollByVehicle, mockFuelByVehicle, mockClients } from '@/lib/mock';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

const TABS = ['trip', 'finance', 'fastag', 'fuel', 'client'];

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useTranslations('common');
  const { data } = useDashboardReport();
  const [tab, setTab] = useState('finance');
  const [range, setRange] = useState({ from: '2026-01-01', to: '2026-06-30' });

  const tripPnl = mockRevenueSeries.map((m) => ({ month: m.month, pnl: m.revenue - m.cost }));
  const clientRevenue = mockClients.map((c) => ({ name: c.company_name.split(' ')[0], revenue: c.outstanding + 200000 }));

  return (
    <div>
      <PageHeader
        title={t('title')} subtitle={t('subtitle')} icon={BarChart3}
        actions={<Button variant="outline" icon={Download}>{tc('exportCsv')}</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-brand-border bg-white p-1">
          {TABS.map((tab2) => (
            <button key={tab2} onClick={() => setTab(tab2)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${tab === tab2 ? 'bg-brand-navy text-white' : 'text-brand-muted hover:bg-brand-surface'}`}>
              {t(tab2)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <FormInput type="date" label={t('fromDate')} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <FormInput type="date" label={t('toDate')} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </div>
      </div>

      <motion.div key={tab} {...fadeUp} className="card p-5">
        {tab === 'finance' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('clientRevenue')} — Revenue vs Cost</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Legend />
                  <Bar dataKey="revenue" name={tc('total')} fill="#1A56DB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="#D97706" radius={[6, 6, 0, 0]} />
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
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Line type="monotone" dataKey="pnl" name="Net P&L" stroke="#065F46" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'fastag' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('fastag')} — Toll by vehicle</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTollByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="vehicle" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="toll" fill="#0F766E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === 'fuel' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-brand-navy">{t('fuel')} — Spend & Litres</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockFuelByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="vehicle" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="spend" fill="#9A3412" radius={[6, 6, 0, 0]} />
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
                  <Bar dataKey="revenue" fill="#1A56DB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {data?._mock !== false && <p className="mt-4 text-xs text-brand-muted">{tc('demoMode')}</p>}
      </motion.div>
    </div>
  );
}
