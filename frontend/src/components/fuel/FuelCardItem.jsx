'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Wifi, Ban, ShieldCheck, UserPlus, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import FormInput from '@/components/ui/FormInput';
import { FUEL_CARD_TYPES } from '@/lib/constants';
import { mockVehicles, mockDrivers } from '@/lib/mock';
import { formatINR, pct, cn } from '@/lib/utils';

function cardTypeLabel(value) {
  return FUEL_CARD_TYPES.find((c) => c.value === value)?.label || value;
}

// Group the card number into 4-digit blocks, masking all but the last 4.
function groupedNumber(num = '') {
  const last4 = String(num).slice(-4).padStart(4, '•');
  return `•••• •••• •••• ${last4}`;
}

export default function FuelCardItem({ card, onAssign, onBlock }) {
  const t = useTranslations('fuel');
  const tc = useTranslations('common');
  const [assignOpen, setAssignOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [vehicleId, setVehicleId] = useState(String(card?.vehicle?.id || ''));
  const [driverId, setDriverId] = useState(String(card?.driver?.id || ''));

  if (!card) return null;

  const spendPct = pct(card.monthly_spend, card.monthly_limit);
  const overLimit = spendPct >= 90;
  const blocked = !card.is_active;

  const submitAssign = () => {
    onAssign?.(card, {
      vehicle: mockVehicles.find((v) => String(v.id) === vehicleId),
      driver: mockDrivers.find((d) => String(d.id) === driverId),
    });
    setAssignOpen(false);
  };

  const submitBlock = () => {
    if (!reason.trim()) return;
    onBlock?.(card, { block: true, reason });
    setBlockOpen(false);
    setReason('');
  };

  return (
    <div className="card overflow-hidden p-0">
      {/* ── Physical fleet-card face ── */}
      <div
        className={cn(
          'relative isolate overflow-hidden bg-gradient-to-br from-brand-fuel to-[#5b1c0a] p-5 text-white',
          blocked && 'grayscale-[35%]',
        )}
      >
        {/* decorative arcs */}
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -left-6 h-32 w-32 rounded-full bg-black/10" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              {t('cardLabel')}
            </p>
            <p className="font-display text-sm font-bold">{cardTypeLabel(card.card_type)}</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur',
              blocked ? 'bg-black/30 text-red-200' : 'bg-white/20 text-white',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', blocked ? 'bg-red-300' : 'bg-emerald-300')} />
            {blocked ? t('block') : tc('active')}
          </span>
        </div>

        {/* chip + contactless */}
        <div className="relative mt-4 flex items-center gap-3">
          <div className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner ring-1 ring-amber-500/40" />
          <Wifi className="h-4 w-4 rotate-90 text-white/70" />
        </div>

        {/* number */}
        <p className="relative mt-3 font-mono text-lg tracking-[0.18em] text-white">
          {groupedNumber(card.card_number)}
        </p>

        {/* holder + balance */}
        <div className="relative mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-white/60">{tc('driver')}</p>
            <p className="truncate text-sm font-medium">{card.driver?.name || '—'}</p>
            <p className="font-mono text-[11px] text-white/70">{card.vehicle?.registration_no || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-white/60">{t('balance')}</p>
            <p className="font-mono text-lg font-bold">{formatINR(card.balance)}</p>
          </div>
        </div>

        {blocked && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Lock className="h-5 w-5 text-white/70" />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        {/* Monthly spend vs limit */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-muted">{t('monthlySpend')}</span>
          <span className="font-mono text-brand-text">
            {formatINR(card.monthly_spend)} / {formatINR(card.monthly_limit)}
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-surface">
          <div
            className={cn('h-full rounded-full transition-all', overLimit ? 'bg-brand-danger' : 'bg-brand-fuel')}
            style={{ width: `${spendPct}%` }}
          />
        </div>

        {/* Allowed products */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.allowed_products?.map((p) => (
            <span key={p} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-brand-fuel">
              {t(`products.${p}`)}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" icon={UserPlus} onClick={() => setAssignOpen(true)} className="flex-1">
            {t('assign')}
          </Button>
          {card.is_active ? (
            <Button variant="danger" size="sm" icon={Ban} onClick={() => setBlockOpen(true)} className="flex-1">
              {t('block')}
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              icon={ShieldCheck}
              onClick={() => onBlock?.(card, { block: false })}
              className="flex-1"
            >
              {t('unblock')}
            </Button>
          )}
        </div>
      </div>

      {/* Assign — aside panel */}
      <Drawer
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={t('assign')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAssignOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={submitAssign}>
              {tc('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput as="select" label={tc('vehicle')} name="vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">—</option>
            {mockVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration_no}
              </option>
            ))}
          </FormInput>
          <FormInput as="select" label={tc('driver')} name="driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">—</option>
            {mockDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </FormInput>
        </div>
      </Drawer>

      {/* Block reason modal */}
      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={t('block')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setBlockOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="danger" size="sm" disabled={!reason.trim()} onClick={submitBlock}>
              {t('block')}
            </Button>
          </>
        }
      >
        <FormInput
          as="textarea"
          label={t('blockReason')}
          name="block_reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('blockReason')}
        />
      </Modal>
    </div>
  );
}
