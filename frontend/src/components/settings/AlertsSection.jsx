'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useConfig, useUpdateConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/utils';

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

export default function AlertsSection() {
  const t = useTranslations('settingsPage.alerts');
  const tc = useTranslations('settingsPage');
  const toast = useToast();
  const { config } = useConfig();
  const updateConfig = useUpdateConfig();

  const [savedTrigger, setSavedTrigger] = useState(0);
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: config.alerts,
  });

  useEffect(() => {
    reset(config.alerts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.alerts.lowBalanceThreshold, config.alerts.docExpiryLeadDays]);

  const notifyEmail = watch('notifyEmail');
  const notifySms = watch('notifySms');

  const onSubmit = async (values) => {
    await updateConfig.mutateAsync({
      alerts: {
        ...values,
        lowBalanceThreshold: Number(values.lowBalanceThreshold),
        docExpiryLeadDays: Number(values.docExpiryLeadDays),
      },
    });
    setSavedTrigger((n) => n + 1);
    toast.success(tc('saved'), tc('savedBody'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-blue" />
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

      <div className="card space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            label={t('lowBalanceThreshold')}
            type="number"
            min="0"
            helpText={t('lowBalanceHelp')}
            {...register('lowBalanceThreshold')}
          />
          <FormInput
            label={t('docExpiryLeadDays')}
            type="number"
            min="0"
            helpText={t('docExpiryHelp')}
            {...register('docExpiryLeadDays')}
          />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-brand-navy">{t('channelsTitle')}</h3>
        <Toggle
          checked={!!notifyEmail}
          onChange={(v) => setValue('notifyEmail', v, { shouldDirty: true })}
          label={t('notifyEmail')}
          description={t('notifyEmailHelp')}
        />
        <Toggle
          checked={!!notifySms}
          onChange={(v) => setValue('notifySms', v, { shouldDirty: true })}
          label={t('notifySms')}
          description={t('notifySmsHelp')}
        />
      </div>
    </form>
  );
}
