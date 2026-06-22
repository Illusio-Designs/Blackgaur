'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, User, Ban, ShieldCheck, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import { FUEL_CARD_TYPES } from '@/lib/constants';
import { mockVehicles, mockDrivers } from '@/lib/mock';
import { formatINR, mask, pct, cn } from '@/lib/utils';

function cardTypeLabel(value) {
  return FUEL_CARD_TYPES.find((c) => c.value === value)?.label || value;
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
    <div className="card border-l-4 border-l-brand-fuel p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-brand-navy">
            <CreditCard className="h-4 w-4 text-brand-fuel" />
            {mask(card.card_number)}
          </p>
          <p className="mt-0.5 text-xs text-brand-muted">{cardTypeLabel(card.card_type)}</p>
        </div>
        <StatusBadge status={card.is_active ? 'active' : 'blocked'} label={card.is_active ? tc('active') : t('block')} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-brand-muted">
        <span className="font-mono text-brand-text">{card.vehicle?.registration_no}</span>
        <span className="text-brand-border">•</span>
        <User className="h-3.5 w-3.5" />
        <span className="truncate">{card.driver?.name}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-brand-muted">{t('balance')}</span>
        <span className="font-mono text-base font-semibold text-brand-navy">{formatINR(card.balance)}</span>
      </div>

      {/* Monthly spend vs limit */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-muted">{t('monthlySpend')}</span>
          <span className="font-mono text-brand-text">
            {formatINR(card.monthly_spend)} / {formatINR(card.monthly_limit)}
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-surface">
          <div
            className={cn('h-full rounded-full transition-all', overLimit ? 'bg-brand-danger' : 'bg-brand-fuel')}
            style={{ width: `${spendPct}%` }}
          />
        </div>
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

      {/* Assign modal */}
      <Modal
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
          <FormInput as="select" label={tc('actions')} name="vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">—</option>
            {mockVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration_no}
              </option>
            ))}
          </FormInput>
          <FormInput as="select" label="Driver" name="driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">—</option>
            {mockDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </FormInput>
        </div>
      </Modal>

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
