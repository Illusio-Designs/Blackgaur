'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plug, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useConfig, useUpdateConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/utils';

const FASTAG_PROVIDERS = ['IHMCL', 'HDFC', 'SBI', 'ICICI', 'Paytm'];
const FUEL_PROVIDERS = ['HPCL', 'IOCL', 'BPCL', 'Shell'];

function StatusChip({ configured, label }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        configured ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-border/60 text-brand-muted',
      )}
    >
      {configured ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {label}
    </span>
  );
}

export default function IntegrationsSection() {
  const t = useTranslations('settingsPage.integrations');
  const tc = useTranslations('settingsPage');
  const toast = useToast();
  const { config } = useConfig();
  const updateConfig = useUpdateConfig();

  const [savedTrigger, setSavedTrigger] = useState(0);
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: config.integrations,
  });

  useEffect(() => {
    reset(config.integrations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.integrations.otpProvider, config.integrations.fastagProvider]);

  const fuelProviders = watch('fuelProviders') || [];

  const toggleFuel = (p) => {
    const next = fuelProviders.includes(p)
      ? fuelProviders.filter((x) => x !== p)
      : [...fuelProviders, p];
    setValue('fuelProviders', next, { shouldDirty: true });
  };

  const onSubmit = async (values) => {
    await updateConfig.mutateAsync({
      integrations: {
        ...values,
        fastagLowBalanceDefault: Number(values.fastagLowBalanceDefault),
      },
    });
    setSavedTrigger((n) => n + 1);
    toast.success(tc('saved'), tc('savedBody'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-brand-blue" />
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

      {/* secrets note */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
        <p className="text-sm text-brand-navy">{t('secretsNote')}</p>
      </div>

      {/* OTP */}
      <div className="card space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-navy">{t('otpTitle')}</h3>
          <StatusChip configured label={t('configured')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput label={t('otpProvider')} {...register('otpProvider')} />
          <FormInput label={t('msg91SenderId')} {...register('msg91SenderId')} />
        </div>
      </div>

      {/* FASTag */}
      <div className="card space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-navy">{t('fastagTitle')}</h3>
          <StatusChip configured label={t('configured')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormInput as="select" label={t('fastagProvider')} {...register('fastagProvider')}>
            {FASTAG_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </FormInput>
          <FormInput
            label={t('fastagLowBalanceDefault')}
            type="number"
            min="0"
            {...register('fastagLowBalanceDefault')}
          />
          <FormInput
            label={t('fastagSyncCron')}
            className="font-mono"
            helpText={t('cronHelp')}
            {...register('fastagSyncCron')}
          />
        </div>
      </div>

      {/* Fuel */}
      <div className="card space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-navy">{t('fuelTitle')}</h3>
          <StatusChip
            configured={fuelProviders.length > 0}
            label={fuelProviders.length > 0 ? t('configured') : t('notConfigured')}
          />
        </div>
        <div>
          <label className="label-base">{t('fuelProviders')}</label>
          <div className="flex flex-wrap gap-2">
            {FUEL_PROVIDERS.map((p) => {
              const active = fuelProviders.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleFuel(p)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                    active
                      ? 'border-brand-blue bg-brand-blue text-white'
                      : 'border-brand-border bg-white text-brand-navy hover:border-brand-blue/40',
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
        <FormInput
          label={t('fuelSyncCron')}
          className="font-mono"
          helpText={t('cronHelp')}
          {...register('fuelSyncCron')}
        />
      </div>
    </form>
  );
}
