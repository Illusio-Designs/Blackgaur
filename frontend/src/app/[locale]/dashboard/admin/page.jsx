'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Truck, PackageCheck, ReceiptText, IndianRupee,
  Wallet, Fuel, Gauge, ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import KPICard from '@/components/ui/KPICard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { useDashboardReport } from '@/hooks/useReports';
import { formatINRCompact, timeAgo } from '@/lib/utils';
import { statusColor } from '@/lib/constants';
import { fadeUp, stagger, staggerItem } from '@/lib/animations';
import { useAuditLogs } from '@/hooks/useAudit';

const PIE_COLORS = ['#64748B', '#D97706', '#1A56DB', '#065F46', '#991B1B'];

export default function AdminOverviewPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const tt = useTranslations('trips');
  const { data, isLoading } = useDashboardReport();
  const d = data || {};
  const { data: auditData } = useAuditLogs({ limit: 6 });
  const activity = auditData?.data ?? [];

  const kpis = [
    { label: t('activeTrips'), value: d.active_trips ?? 0, icon: Truck, delta: `+2 ${t('today')}`, accent: 'text-brand-blue', format: (v) => Math.round(v) },
    { label: t('deliveredThisMonth'), value: d.delivered_this_month ?? 0, icon: PackageCheck, delta: '+12%', accent: 'text-brand-success', format: (v) => Math.round(v) },
    { label: t('pendingExpenses'), value: d.pending_expenses ?? 0, icon: ReceiptText, delta: t('needsReview'), trend: 'down', accent: 'text-brand-amber', format: (v) => Math.round(v) },
    { label: t('revenue'), value: d.revenue_this_month ?? 0, icon: IndianRupee, delta: '+8.4%', accent: 'text-brand-success', format: (v) => formatINRCompact(v) },
    { label: t('fastagSpend'), value: d.fastag_spend ?? 0, icon: Wallet, delta: '+3.1%', accent: 'text-brand-fastag', format: (v) => formatINRCompact(v) },
    { label: t('fuelSpend'), value: d.fuel_spend ?? 0, icon: Fuel, delta: '+5.7%', accent: 'text-brand-fuel', format: (v) => formatINRCompact(v) },
  ];

  return (
    <div>
      <PageHeader
        title={t('overview')}
        subtitle={t('welcome', { name: 'Arjun' })}
        icon={LayoutDashboard}
        actions={
          <Link href="/dashboard/admin/users">
            <Button variant="navy" icon={Gauge}>{t('manageUsers')}</Button>
          </Link>
        }
      />

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
      >
        {kpis.map((k) => (
          <motion.div key={k.label} variants={staggerItem}>
            <KPICard {...k} loading={isLoading} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} className="card p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-brand-navy">{t('revenueVsCost')}</h3>
          <div className="mt-4 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.revenue_series || []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A56DB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1A56DB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(m) => (tc.has(`monthsShort.${m}`) ? tc(`monthsShort.${m}`) : m)} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip formatter={(v) => formatINRCompact(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1A56DB" strokeWidth={2} fill="url(#rev)" isAnimationActive={false} />
                <Area type="monotone" dataKey="cost" stroke="#D97706" strokeWidth={2} fill="url(#cost)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="card p-5">
          <h3 className="font-display text-base font-semibold text-brand-navy">{t('tripStatus')}</h3>
          <div className="mt-2 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.trip_status || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {(d.trip_status || []).map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" formatter={(value) => <span className="text-xs text-brand-muted">{tt(`status.${value}`)}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-brand-navy">{t('recentActivity')}</h3>
            <Link href="/dashboard/admin/audit-logs" className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
              {tc('viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-brand-border/70">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusColor('active').dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-brand-text">
                    <span className="font-medium text-brand-navy">{a.user_name}</span>{' '}
                    <span className="font-mono text-xs text-brand-muted">{a.action}</span>{' '}
                    {a.resource_label}
                  </p>
                </div>
                {a.api && <span className="rounded bg-brand-fastag/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-fastag">API</span>}
                <span className="shrink-0 text-xs text-brand-muted">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} className="card p-5">
          <h3 className="font-display text-base font-semibold text-brand-navy">{t('quickActions')}</h3>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link href="/dashboard/admin/users" className="block"><Button variant="outline" className="w-full justify-start" icon={Gauge}>{t('manageUsers')}</Button></Link>
            <Link href="/dashboard/admin/audit-logs" className="block"><Button variant="outline" className="w-full justify-start" icon={LayoutDashboard}>{t('auditShortcut')}</Button></Link>
            <Link href="/dashboard/finance/expenses" className="block"><Button variant="outline" className="w-full justify-start" icon={ReceiptText}>{tn('expenses')}</Button></Link>
          </div>
          <div className="mt-5 rounded-xl bg-brand-navy p-4 text-white">
            <p className="text-sm text-white/70">{t('fleetUtilisation')}</p>
            <p className="mt-1 font-display text-3xl font-bold">{d.fleet_utilisation ?? 0}%</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-brand-amber" style={{ width: `${d.fleet_utilisation ?? 0}%` }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
