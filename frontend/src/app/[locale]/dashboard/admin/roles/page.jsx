'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockRoles } from '@/lib/mock';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

const RESOURCES = ['users', 'roles', 'trips', 'vehicles', 'drivers', 'trip_expenses', 'fastag_wallets', 'fuel_cards', 'invoices', 'clients', 'lr', 'reports', 'audit_logs'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'approve'];

// From section 2.2 — granular matrix (CRUD/approve summarized per role).
const MATRIX = {
  admin: { _all: true },
  trip_manager: { trips: ['create', 'read', 'update', 'delete'], vehicles: ['create', 'read', 'update', 'delete'], drivers: ['create', 'read', 'update', 'delete'], trip_expenses: ['create', 'read'], fastag_wallets: ['read'], fuel_cards: ['read'], clients: ['read'], lr: ['create', 'read', 'update', 'delete'], reports: ['read'] },
  finance_manager: { trips: ['read'], vehicles: ['read'], trip_expenses: ['read', 'approve'], fastag_wallets: ['read'], fuel_cards: ['read'], invoices: ['create', 'read', 'update', 'delete', 'approve'], clients: ['read'], lr: ['read'], reports: ['read'] },
  account_manager: { trips: ['read'], invoices: ['create', 'read', 'update', 'delete'], clients: ['create', 'read', 'update', 'delete'], lr: ['create', 'read', 'update', 'delete'], reports: ['read'] },
  driver: { trips: ['read', 'update'], trip_expenses: ['create', 'read'], lr: ['read'] },
};

export default function RolesPage() {
  const t = useTranslations('rolesPage');
  const tr = useTranslations('roles');
  const [selected, setSelected] = useState('finance_manager');

  const can = (role, resource, action) => {
    const m = MATRIX[role];
    if (m?._all) return true;
    return m?.[resource]?.includes(action) || false;
  };

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={ShieldCheck} accent="text-brand-blue" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          {mockRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.name)}
              className={cn('w-full rounded-xl border p-4 text-left transition', selected === r.name ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-border bg-white hover:bg-brand-surface')}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-navy">{tr(r.name)}</span>
                {r.is_system && <StatusBadge status="active" label={t('system')} size="sm" />}
              </div>
              <p className="mt-1 text-xs text-brand-muted">{tr(`${r.name}_desc`)}</p>
              <p className="mt-2 text-xs font-medium text-brand-blue">{r.users} users</p>
            </button>
          ))}
        </div>

        <motion.div {...fadeUp} key={selected} className="card overflow-hidden lg:col-span-3">
          <div className="border-b border-brand-border px-5 py-4">
            <h3 className="font-display font-semibold text-brand-navy">{t('permissionGrid')} — {tr(selected)}</h3>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface/60">
                  <th className="px-4 py-3 text-left font-semibold text-brand-muted">{t('resource')}</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="px-3 py-3 text-center font-semibold capitalize text-brand-muted">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((res) => (
                  <tr key={res} className="border-b border-brand-border/60">
                    <td className="px-4 py-2.5 font-medium text-brand-text">{res.replace(/_/g, ' ')}</td>
                    {ACTIONS.map((a) => {
                      const allowed = can(selected, res, a);
                      return (
                        <td key={a} className="px-3 py-2.5 text-center">
                          {allowed ? (
                            <Check className="mx-auto h-4 w-4 text-brand-success" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-brand-border" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
