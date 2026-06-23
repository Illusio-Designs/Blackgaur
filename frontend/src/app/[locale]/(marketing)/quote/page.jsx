'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, User, Building2, MapPin, Package, Weight, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FormInput from '@/components/ui/FormInput';
import PhoneInput from '@/components/ui/PhoneInput';
import Button from '@/components/ui/Button';
import { useBranding } from '@/hooks/useBranding';
import { useToast } from '@/components/ui/Toast';
import { INDIAN_CITIES } from '@/lib/constants';

const CARGO_TYPES = [
  'General goods',
  'Industrial / machinery',
  'FMCG / consumer goods',
  'Perishables (cold chain)',
  'Container / ODC',
  'Hazardous',
  'Other',
];

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  company: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{7,12}$/, 'Enter a valid phone number'),
  origin: z.string().min(2, 'Pickup location is required'),
  destination: z.string().min(2, 'Delivery location is required'),
  cargoType: z.string().min(1, 'Select a cargo type'),
  weight: z.string().optional(),
  message: z.string().optional(),
});

export default function QuotePage() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      origin: '',
      destination: '',
      cargoType: '',
      weight: '',
      message: '',
    },
  });

  const onSubmit = async () => {
    // No real endpoint — simulate a request submission.
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    toast.success(t('quoteForm.sentTitle'), t('quoteForm.sentBody'));
    reset();
  };

  return (
    <div className="bg-white">
      <section className="bg-brand-navy px-4 pt-36 pb-20 text-center text-white">
        <div className="container-page max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {t('quoteTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-slate-300"
          >
            {t('quoteSubtitle', { company: branding.companyName })}
          </motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-page max-w-2xl">
          <div className="card p-7 sm:p-9">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [0.6, 1.12, 1] }}
                    transition={{ duration: 0.45 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-brand-success"
                  >
                    <CheckCircle2 className="h-9 w-9" />
                  </motion.span>
                  <p className="mt-5 font-display text-xl font-semibold text-brand-navy">
                    {t('quoteForm.sentTitle')}
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-brand-muted">
                    {t('quoteForm.sentBody')}
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                    {t('quoteForm.another')}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormInput
                      label={t('quoteForm.name')}
                      icon={User}
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <FormInput
                      label={t('quoteForm.company')}
                      icon={Building2}
                      error={errors.company?.message}
                      {...register('company')}
                    />
                  </div>

                  <PhoneInput
                    label={t('quoteForm.phone')}
                    name="phone"
                    country="IN"
                    value={watch('phone') || ''}
                    onChange={(digits) =>
                      setValue('phone', digits, { shouldValidate: true })
                    }
                    error={errors.phone?.message}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormInput
                      as="select"
                      label={t('quoteForm.origin')}
                      icon={MapPin}
                      error={errors.origin?.message}
                      defaultValue=""
                      {...register('origin')}
                    >
                      <option value="" disabled>
                        {t('quoteForm.select')}
                      </option>
                      {INDIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </FormInput>
                    <FormInput
                      as="select"
                      label={t('quoteForm.destination')}
                      icon={MapPin}
                      error={errors.destination?.message}
                      defaultValue=""
                      {...register('destination')}
                    >
                      <option value="" disabled>
                        {t('quoteForm.select')}
                      </option>
                      {INDIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </FormInput>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormInput
                      as="select"
                      label={t('quoteForm.cargoType')}
                      icon={Package}
                      error={errors.cargoType?.message}
                      defaultValue=""
                      {...register('cargoType')}
                    >
                      <option value="" disabled>
                        {t('quoteForm.select')}
                      </option>
                      {CARGO_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </FormInput>
                    <FormInput
                      label={t('quoteForm.weight')}
                      icon={Weight}
                      placeholder="e.g. 12 tonnes"
                      error={errors.weight?.message}
                      {...register('weight')}
                    />
                  </div>

                  <FormInput
                    as="textarea"
                    label={t('quoteForm.message')}
                    icon={MessageSquare}
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                  >
                    {t('quoteForm.submit')}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
