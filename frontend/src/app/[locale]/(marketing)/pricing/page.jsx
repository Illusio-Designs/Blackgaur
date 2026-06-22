'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import { stagger, staggerItem } from '@/lib/animations';
import { cn, formatINR } from '@/lib/utils';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    monthly: 4999,
    popular: false,
    features: ['Up to 25 vehicles', 'Trip & LR management', 'Basic reports', 'Email support'],
  },
  {
    key: 'growth',
    name: 'Growth',
    monthly: 12999,
    popular: true,
    features: [
      'Up to 150 vehicles',
      'FASTag & fuel-card sync',
      'RCM/GST invoicing',
      'Trip P&L analytics',
      'Priority support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthly: null,
    popular: false,
    features: [
      'Unlimited vehicles',
      'Custom integrations',
      'Dedicated success manager',
      'SLA & audit exports',
      'SSO & advanced roles',
    ],
  },
];

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — every plan starts with a 14-day free trial. No card required, and you keep your data if you upgrade.',
  },
  {
    q: 'How does FASTag and fuel-card reconciliation work?',
    a: 'We sync toll and fuel transactions and auto-match them to the right trip and vehicle, flagging anything unmatched for review.',
  },
  {
    q: 'Are your invoices GST and RCM compliant?',
    a: 'Absolutely. Blackgaur generates GST-compliant invoices with reverse-charge (RCM) handling and TDS, ready for GTA operators.',
  },
  {
    q: 'Can I change plans later?',
    a: 'You can upgrade or downgrade at any time. Annual billing is prorated and changes take effect on your next cycle.',
  },
  {
    q: 'Do you offer onboarding support?',
    a: 'Growth and Enterprise plans include guided onboarding. Enterprise customers also get a dedicated success manager.',
  },
];

function PlanPrice({ plan, annual }) {
  if (plan.monthly == null) {
    return <span className="font-display text-4xl font-extrabold text-brand-navy">Custom</span>;
  }
  const amount = annual ? Math.round(plan.monthly * 0.8) : plan.monthly;
  return (
    <div className="flex items-end gap-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={amount}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="font-display text-4xl font-extrabold text-brand-navy"
        >
          {formatINR(amount)}
        </motion.span>
      </AnimatePresence>
      <span className="pb-1.5 text-sm text-brand-muted">/month</span>
    </div>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display text-base font-semibold text-brand-navy">{item.q}</span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-brand-muted transition', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-brand-muted">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const t = useTranslations('marketing');
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-white">
      <section className="bg-brand-navy px-4 pt-36 pb-20 text-center text-white">
        <div className="container-page max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {t('pricingTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-slate-300"
          >
            {t('pricingSubtitle')}
          </motion.p>

          {/* monthly / annual toggle */}
          <div className="mt-9 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {[
              { v: false, label: 'Monthly' },
              { v: true, label: 'Annual −20%' },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setAnnual(opt.v)}
                className="relative rounded-full px-5 py-2 text-sm font-medium text-white"
              >
                {annual === opt.v && (
                  <motion.span
                    layoutId="billing-toggle"
                    className="absolute inset-0 rounded-full bg-brand-amber"
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-page">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {PLANS.map((plan) => (
              <motion.div
                key={plan.key}
                variants={staggerItem}
                className={cn(
                  'card relative flex flex-col p-7',
                  plan.popular && 'ring-2 ring-brand-blue shadow-elevated',
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white">
                    {t('mostPopular')}
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold text-brand-navy">{plan.name}</h3>
                <div className="mt-4">
                  <PlanPrice plan={plan} annual={annual} />
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-brand-text">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="mt-7">
                  <Button
                    variant={plan.popular ? 'amber' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    {t('choosePlan')}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-surface py-20 sm:py-28">
        <div className="container-page max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-brand-navy">
            {t('faqTitle')}
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
