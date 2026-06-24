'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import RCMBadge from '@/components/ui/RCMBadge';
import { useClients } from '@/hooks/useClients';
import { computeInvoice, amountInWords, COMPANY_STATE_CODE } from '@/lib/gst';
import { useConfig } from '@/hooks/useConfig';
import { formatINR, cn } from '@/lib/utils';

const STEP_KEYS = ['charges', 'gst', 'review'];

const DEFAULTS = {
  freight_amount: 0,
  loading_charges: 0,
  unloading_charges: 0,
  detention_charges: 0,
  other_charges: 0,
  client_id: '',
  is_rcm: true,
  gst_rate: 5,
  client_state_code: COMPANY_STATE_CODE,
};

export default function InvoiceForm({ mode = 'create', initialData, onSubmit }) {
  const t = useTranslations('invoices');
  const tc = useTranslations('common');
  const mockClients = useClients().data?.data ?? [];
  const { config } = useConfig();
  // RCM is driven by the company's own registration/opt-in (Settings → Tax & RCM).
  // Registered under RCM → reverse charge (no GST on invoice); else forward charge.
  const rcmDefault = config?.tax?.rcmDefault ?? true;
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ ...DEFAULTS, is_rcm: rcmDefault, ...(initialData || {}) });

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }));
  const num = (key) => (e) => set(key, Number(e.target.value) || 0);

  const computed = useMemo(() => computeInvoice(values), [values]);

  const selectClient = (e) => {
    const id = e.target.value;
    const client = mockClients.find((c) => String(c.id) === String(id));
    setValues((v) => ({
      ...v,
      client_id: id,
      client_state_code: client?.state_code || COMPANY_STATE_CODE,
      is_rcm: client?.rcm_applicable ?? v.is_rcm,
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    onSubmit?.({ ...values, ...computed });
  };

  const chargeFields = [
    ['freight_amount', t('freight')],
    ['loading_charges', t('loadingCharges')],
    ['unloading_charges', t('unloadingCharges')],
    ['detention_charges', t('detentionCharges')],
    ['other_charges', t('otherCharges')],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center">
        {STEP_KEYS.map((key, i) => (
          <div key={key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
                  i < step && 'bg-brand-success text-white',
                  i === step && 'bg-brand-blue text-white',
                  i > step && 'bg-brand-surface text-brand-muted',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn('text-xs font-medium', i === step ? 'text-brand-navy' : 'text-brand-muted')}>
                {t(`steps.${key}`)}
              </span>
            </div>
            {i < STEP_KEYS.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1 rounded', i < step ? 'bg-brand-success' : 'bg-brand-border')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {chargeFields.map(([key, label]) => (
                <FormInput
                  key={key}
                  type="number"
                  min="0"
                  label={label}
                  name={key}
                  value={values[key]}
                  onChange={num(key)}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput as="select" label={t('client')} name="client_id" value={values.client_id} onChange={selectClient}>
                <option value="">{tc('search')}…</option>
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </FormInput>

              <FormInput
                label={t('clientStateCode')}
                name="client_state_code"
                value={values.client_state_code}
                onChange={(e) => set('client_state_code', e.target.value)}
              />

              <FormInput as="select" label={t('gst')} name="gst_rate" value={values.gst_rate} onChange={num('gst_rate')}>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={0}>{t('exempt')}</option>
              </FormInput>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-border bg-white p-3 sm:col-span-2">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-brand-navy">{t('rcm_notice')}</span>
                  <RCMBadge isRcm={values.is_rcm} />
                </span>
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={values.is_rcm}
                    onChange={(e) => set('is_rcm', e.target.checked)}
                  />
                  <span className="h-6 w-11 rounded-full bg-brand-border transition peer-checked:bg-brand-amber" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4">
              <dl className="space-y-2 text-sm">
                <Row label={t('subtotal')} value={formatINR(computed.subtotal, { decimals: 2 })} />
                {computed.is_rcm ? (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-brand-amber">
                    {t('rcm_yes')} — {t('rcm_notice')}
                  </div>
                ) : computed.gstType === 'interstate' ? (
                  <Row label={`${t('igst')} (${values.gst_rate}%)`} value={formatINR(computed.igst_amount, { decimals: 2 })} />
                ) : (
                  <>
                    <Row label={`${t('cgst')} (${values.gst_rate / 2}%)`} value={formatINR(computed.cgst_amount, { decimals: 2 })} />
                    <Row label={`${t('sgst')} (${values.gst_rate / 2}%)`} value={formatINR(computed.sgst_amount, { decimals: 2 })} />
                  </>
                )}
                <div className="flex items-center justify-between border-t border-brand-border pt-2.5">
                  <dt className="font-semibold text-brand-navy">{t('totalAmount')}</dt>
                  <dd className="font-mono text-lg font-bold text-brand-navy">
                    {formatINR(computed.total_amount, { decimals: 2 })}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-brand-border pt-3 text-xs text-brand-muted">
                <span className="font-medium text-brand-text">{t('inWords')}: </span>
                {amountInWords(computed.total_amount)}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ChevronLeft} onClick={prev} disabled={step === 0}>
          {tc('back')}
        </Button>
        {step < STEP_KEYS.length - 1 ? (
          <Button variant="primary" iconRight={<ChevronRight className="h-4 w-4" />} onClick={next}>
            {tc('next')}
          </Button>
        ) : (
          <Button variant="success" icon={Check} onClick={handleSubmit}>
            {mode === 'edit' ? tc('save') : t('createInvoice')}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="font-mono text-brand-text">{value}</dd>
    </div>
  );
}
