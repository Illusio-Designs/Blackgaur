'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Receipt, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useConfig, useUpdateConfig } from '@/hooks/useConfig';
import { computeInvoice } from '@/lib/gst';
import { formatINR } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SAMPLE_SUBTOTAL = 10000;

const GST_OPTIONS = [
  { value: 0, key: 'gst0' },
  { value: 5, key: 'gst5' },
  { value: 12, key: 'gst12' },
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-xl border border-brand-border bg-white p-4 text-left transition hover:border-brand-blue/40"
    >
      <span>
        <span className="block text-sm font-semibold text-brand-navy">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-brand-muted">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          'mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition',
          checked ? 'bg-brand-blue' : 'bg-brand-border',
        )}
      >
        <span
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </button>
  );
}

export default function TaxSection() {
  const t = useTranslations('settingsPage.tax');
  const tc = useTranslations('settingsPage');
  const toast = useToast();
  const { config } = useConfig();
  const updateConfig = useUpdateConfig();

  const [savedTrigger, setSavedTrigger] = useState(0);
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: config.tax,
  });

  useEffect(() => {
    reset(config.tax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.tax.rcmDefault, config.tax.gstRate, config.tax.itcEnabled]);

  const rcmDefault = watch('rcmDefault');
  const gstRate = Number(watch('gstRate'));
  const placeOfSupplyAuto = watch('placeOfSupplyAuto');
  const itcEnabled = watch('itcEnabled');
  const tdsRate = Number(watch('tdsRate')) || 0;

  // Live example computed from the same helpers used by invoices (§8.3/§8.4).
  const example = computeInvoice({
    freight_amount: SAMPLE_SUBTOTAL,
    is_rcm: rcmDefault,
    gst_rate: gstRate,
    tds_rate: tdsRate,
  });

  const onSubmit = async (values) => {
    await updateConfig.mutateAsync({
      tax: { ...values, gstRate: Number(values.gstRate), tdsRate: Number(values.tdsRate) },
    });
    setSavedTrigger((n) => n + 1);
    toast.success(tc('saved'), tc('savedBody'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-blue" />
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-navy">{t('title')}</h2>
            <p className="mt-0.5 text-sm text-brand-muted">{t('subtitle')}</p>
          </div>
        </div>
        <TaskCompleteFX type="approve" trigger={savedTrigger}>
          <Button type="submit" variant="amber" loading={updateConfig.isPending}>
            {tc('save')}
          </Button>
        </TaskCompleteFX>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="card space-y-4 p-6">
            <Toggle
              checked={!!rcmDefault}
              onChange={(v) => setValue('rcmDefault', v, { shouldDirty: true })}
              label={t('rcmDefault')}
              description={t('rcmHelp')}
            />
            <Toggle
              checked={!!placeOfSupplyAuto}
              onChange={(v) => setValue('placeOfSupplyAuto', v, { shouldDirty: true })}
              label={t('placeOfSupplyAuto')}
              description={t('placeOfSupplyHelp')}
            />
            <Toggle
              checked={!!itcEnabled}
              onChange={(v) => setValue('itcEnabled', v, { shouldDirty: true })}
              label={t('itcEnabled')}
              description={t('itcHelp')}
            />
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="font-display text-lg font-semibold text-brand-navy">{t('gstRate')}</h3>
            <div className="space-y-2">
              {GST_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                    gstRate === opt.value
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-brand-border hover:border-brand-blue/40',
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={gstRate === opt.value}
                    onChange={() => setValue('gstRate', opt.value, { shouldDirty: true })}
                    className="h-4 w-4 accent-brand-blue"
                  />
                  <span className="text-sm font-medium text-brand-navy">{t(opt.key)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card space-y-5 p-6">
            <h3 className="font-display text-lg font-semibold text-brand-navy">{t('tdsTitle')}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput
                label={t('tdsRate')}
                type="number"
                step="0.01"
                min="0"
                {...register('tdsRate')}
              />
              <FormInput
                label={t('tdsSection')}
                helpText={t('tdsSectionHelp')}
                {...register('tdsSection')}
              />
            </div>
          </div>
        </div>

        {/* Live example */}
        <div className="card h-fit space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-blue" />
            <h3 className="font-display text-lg font-semibold text-brand-navy">
              {t('exampleTitle')}
            </h3>
          </div>
          <p className="text-sm text-brand-muted">
            {t('exampleIntro', { subtotal: formatINR(SAMPLE_SUBTOTAL, { decimals: 0 }) })}
          </p>
          <dl className="divide-y divide-brand-border text-sm">
            <div className="flex justify-between py-2">
              <dt className="text-brand-muted">{t('exSubtotal')}</dt>
              <dd className="font-medium text-brand-navy">
                {formatINR(example.subtotal, { decimals: 2 })}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-brand-muted">{t('exGst', { rate: gstRate })}</dt>
              <dd className="font-medium text-brand-navy">
                {rcmDefault ? t('exRcmNote') : formatINR(example.gstTotal, { decimals: 2 })}
              </dd>
            </div>
            {tdsRate > 0 ? (
              <div className="flex justify-between py-2">
                <dt className="text-brand-muted">{t('exTds', { rate: tdsRate })}</dt>
                <dd className="font-medium text-brand-danger">
                  -{formatINR(example.tds_amount, { decimals: 2 })}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between py-2">
              <dt className="font-semibold text-brand-navy">{t('exTotal')}</dt>
              <dd className="font-semibold text-brand-navy">
                {formatINR(example.total_amount, { decimals: 2 })}
              </dd>
            </div>
          </dl>
          <p className="rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
            {rcmDefault ? t('rcmExplain') : t('fcmExplain')}
          </p>
        </div>
      </div>
    </form>
  );
}
