'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Check, Lock, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
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

// Expand the matrix into a { roleName: Set('resource:action') } structure.
function buildPerms() {
  const out = {};
  mockRoles.forEach((r) => {
    const set = new Set();
    const m = MATRIX[r.name];
    if (m?._all) {
      RESOURCES.forEach((res) => ACTIONS.forEach((a) => set.add(`${res}:${a}`)));
    } else {
      Object.entries(m || {}).forEach(([res, acts]) => acts.forEach((a) => set.add(`${res}:${a}`)));
    }
    out[r.name] = set;
  });
  return out;
}

export default function RolesPage() {
  const t = useTranslations('rolesPage');
  const tr = useTranslations('roles');
  const toast = useToast();
  const [selected, setSelected] = useState('finance_manager');
  const [permsByRole, setPermsByRole] = useState(buildPerms);
  const [dirty, setDirty] = useState(false);

  const isSystemFull = selected === 'admin'; // Admin = full access, locked
  const can = (res, a) => permsByRole[selected]?.has(`${res}:${a}`);

  const toggle = (res, a) => {
    if (isSystemFull) return;
    setPermsByRole((prev) => {
      const next = { ...prev };
      const set = new Set(next[selected]);
      const key = `${res}:${a}`;
      if (set.has(key)) set.delete(key);
      else set.add(key);
      next[selected] = set;
      return next;
    });
    setDirty(true);
  };

  const save = () => {
    // PUT /roles/:id/permissions — demo: persisted in local state.
    setDirty(false);
    toast.success(t('permissionsSaved'), tr(selected));
  };

  const selectRole = (name) => { setSelected(name); setDirty(false); };

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={ShieldCheck} accent="text-brand-blue" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          {mockRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRole(r.name)}
              className={cn('w-full rounded-xl border p-4 text-left transition', selected === r.name ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-border bg-white hover:bg-brand-surface')}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-navy">{tr(r.name)}</span>
                {r.is_system && <StatusBadge status="active" label={t('system')} size="sm" />}
              </div>
              <p className="mt-1 text-xs text-brand-muted">{tr(`${r.name}_desc`)}</p>
              <p className="mt-2 text-xs font-medium text-brand-blue">{r.users} {t('usersCount')}</p>
            </button>
          ))}
        </div>

        <motion.div {...fadeUp} key={selected} className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between gap-3 border-b border-brand-border px-5 py-4">
            <h3 className="font-display font-semibold text-brand-navy">{t('permissionGrid')} — {tr(selected)}</h3>
            {isSystemFull ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-muted">
                <Lock className="h-3.5 w-3.5" />
                {t('adminFullAccess')}
              </span>
            ) : (
              <Button size="sm" variant="amber" icon={Save} disabled={!dirty} onClick={save}>
                {t('saveChanges')}
              </Button>
            )}
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
                  <tr key={res} className="border-b border-brand-border/60 hover:bg-brand-surface/40">
                    <td className="px-4 py-2.5 font-medium text-brand-text">{res.replace(/_/g, ' ')}</td>
                    {ACTIONS.map((a) => {
                      const allowed = can(res, a);
                      return (
                        <td key={a} className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(res, a)}
                            disabled={isSystemFull}
                            aria-pressed={allowed}
                            aria-label={`${a} ${res}`}
                            className={cn(
                              'mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition',
                              allowed
                                ? 'border-brand-success/30 bg-brand-success/10 text-brand-success'
                                : 'border-brand-border bg-white text-transparent hover:border-brand-blue/40 hover:bg-brand-surface',
                              isSystemFull ? 'cursor-not-allowed opacity-90' : 'cursor-pointer',
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </button>
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
