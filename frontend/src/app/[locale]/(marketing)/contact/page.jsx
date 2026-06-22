'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Mail, Building2, MessageSquare, CheckCircle2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';

const OFFICES = [
  { city: 'Ahmedabad', line: 'Prahlad Nagar, Ahmedabad, Gujarat 380015', tag: 'Headquarters' },
  { city: 'Mumbai', line: 'Andheri East, Mumbai, Maharashtra 400069', tag: 'Operations' },
];

export default function ContactPage() {
  const t = useTranslations('marketing');
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const fields = [
    { key: 'name', label: t('contactForm.name'), icon: User, type: 'text' },
    { key: 'email', label: t('contactForm.email'), icon: Mail, type: 'email' },
    { key: 'company', label: t('contactForm.company'), icon: Building2, type: 'text' },
  ];

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
            {t('contactTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-slate-300"
          >
            {t('contactSubtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          {/* form */}
          <div className="card p-7 sm:p-9">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-brand-success">
                    <CheckCircle2 className="h-9 w-9" />
                  </span>
                  <p className="mt-5 font-display text-xl font-semibold text-brand-navy">
                    {t('contactForm.sent')}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial="initial"
                  animate="animate"
                  variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
                  className="space-y-5"
                >
                  {fields.map((f) => (
                    <motion.div
                      key={f.key}
                      variants={{
                        initial: { opacity: 0, x: -16 },
                        animate: { opacity: 1, x: 0 },
                      }}
                    >
                      <FormInput
                        name={f.key}
                        label={f.label}
                        icon={f.icon}
                        type={f.type}
                        value={form[f.key]}
                        onChange={update(f.key)}
                        required={f.key !== 'company'}
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: -16 },
                      animate: { opacity: 1, x: 0 },
                    }}
                  >
                    <FormInput
                      as="textarea"
                      name="message"
                      label={t('contactForm.message')}
                      icon={MessageSquare}
                      value={form.message}
                      onChange={update('message')}
                      required
                    />
                  </motion.div>
                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: -16 },
                      animate: { opacity: 1, x: 0 },
                    }}
                  >
                    <Button type="submit" variant="amber" size="lg" className="w-full">
                      {t('contactForm.send')}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* side panel */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {OFFICES.map((office) => (
                <motion.div
                  key={office.city}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="card p-5"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                    <MapPin className="h-3.5 w-3.5" />
                    {office.tag}
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold text-brand-navy">
                    {office.city}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-brand-muted">{office.line}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative min-h-[260px] overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <span className="absolute left-1/3 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <MapPin className="h-7 w-7 text-brand-amber drop-shadow" />
              </span>
              <span className="absolute left-2/3 top-1/3 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <MapPin className="h-7 w-7 text-white drop-shadow" />
              </span>
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-brand-navy backdrop-blur">
                Our offices
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
