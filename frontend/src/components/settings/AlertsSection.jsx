'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import Switch from '@/components/ui/Switch';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useConfig, useUpdateConfig } from '@/hooks/useConfig';

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
        <Switch
          checked={!!notifyEmail}
          onChange={(v) => setValue('notifyEmail', v, { shouldDirty: true })}
          label={t('notifyEmail')}
          description={t('notifyEmailHelp')}
        />
        <Switch
          checked={!!notifySms}
          onChange={(v) => setValue('notifySms', v, { shouldDirty: true })}
          label={t('notifySms')}
          description={t('notifySmsHelp')}
        />
      </div>
    </form>
  );
}
