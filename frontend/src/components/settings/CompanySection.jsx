'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import TaskCompleteFX from '@/components/animations/TaskCompleteFX';
import { useToast } from '@/components/ui/Toast';
import { useConfig, useUpdateConfig } from '@/hooks/useConfig';

export default function CompanySection() {
  const t = useTranslations('settingsPage.company');
  const tc = useTranslations('settingsPage');
  const toast = useToast();
  const { config } = useConfig();
  const updateConfig = useUpdateConfig();

  const [savedTrigger, setSavedTrigger] = useState(0);
  const { register, handleSubmit, reset } = useForm({ defaultValues: config.company });

  useEffect(() => {
    reset(config.company);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.company.gstin, config.company.legalName, config.company.invoicePrefix]);

  const onSubmit = async (values) => {
    await updateConfig.mutateAsync({ company: values });
    setSavedTrigger((n) => n + 1);
    toast.success(tc('saved'), tc('savedBody'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brand-blue" />
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
          <FormInput label={t('legalName')} {...register('legalName')} />
          <FormInput label={t('cin')} {...register('cin')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormInput label={t('gstin')} className="font-mono uppercase" {...register('gstin')} />
          <FormInput label={t('pan')} className="font-mono uppercase" {...register('pan')} />
          <FormInput
            label={t('stateCode')}
            helpText={t('stateCodeHelp')}
            {...register('stateCode')}
          />
        </div>
        <FormInput as="textarea" label={t('registeredAddress')} {...register('registeredAddress')} />
      </div>

      <div className="card space-y-5 p-6">
        <h3 className="font-display text-lg font-semibold text-brand-navy">{t('bankTitle')}</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormInput label={t('bankName')} {...register('bankName')} />
          <FormInput label={t('bankAccount')} className="font-mono" {...register('bankAccount')} />
          <FormInput label={t('ifsc')} className="font-mono uppercase" {...register('ifsc')} />
        </div>
      </div>

      <div className="card space-y-5 p-6">
        <h3 className="font-display text-lg font-semibold text-brand-navy">{t('invoiceTitle')}</h3>
        <p className="text-sm text-brand-muted">{t('invoiceHelp')}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput label={t('financialYear')} {...register('financialYear')} />
          <FormInput
            label={t('invoicePrefix')}
            helpText={t('invoicePrefixHelp')}
            {...register('invoicePrefix')}
          />
        </div>
      </div>
    </form>
  );
}
