'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { useBranding } from '@/hooks/useBranding';

export default function ContactPage() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();
  const contact = branding.contact;
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

  const fullAddress = [contact.addressLine, contact.city, contact.state]
    .filter(Boolean)
    .join(', ');

  const details = [
    contact.addressLine && { Icon: MapPin, label: t('contactDetails.address'), value: fullAddress },
    contact.phone && {
      Icon: Phone,
      label: t('contactDetails.phone'),
      value: contact.phone,
      href: `tel:${contact.phone}`,
    },
    contact.email && {
      Icon: Mail,
      label: t('contactDetails.email'),
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    contact.whatsapp && {
      Icon: MessageCircle,
      label: t('contactDetails.whatsapp'),
      value: contact.whatsapp,
      href: `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`,
    },
  ].filter(Boolean);

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

          {/* contact details + map */}
          <div className="space-y-6">
            <div className="card p-7">
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                {branding.companyName}
              </h2>
              <ul className="mt-5 space-y-4">
                {details.map((d) => (
                  <li key={d.label} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <d.Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                        {d.label}
                      </p>
                      {d.href ? (
                        <a
                          href={d.href}
                          target={d.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand-navy transition hover:text-brand-blue"
                        >
                          {d.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-brand-navy">{d.value}</p>
                      )}
                    </div>
                  </li>
                ))}
                {contact.gstin && (
                  <li className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-amber/10 text-brand-amber">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                        GSTIN
                      </p>
                      <p className="font-mono text-sm font-medium text-brand-navy">
                        {contact.gstin}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative min-h-[240px] overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <MapPin className="h-8 w-8 text-brand-amber drop-shadow" />
              </span>
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-brand-navy backdrop-blur">
                {contact.city || t('contactDetails.ourLocation')}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
