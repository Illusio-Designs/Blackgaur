'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Truck, PackageCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const STEPS = ['Booked', 'Loading', 'In Transit', 'Out for Delivery', 'Delivered'];

// Fake lookup table — demo data only.
const LOOKUP = {
  'LR-2024-25-0004': { active: 2, route: 'Mumbai → Surat' },
  'LR-2024-25-0001': { active: 4, route: 'Ahmedabad → Pune' },
  'LR-2024-25-0007': { active: 1, route: 'Delhi → Jaipur' },
};

export default function TrackPage() {
  const t = useTranslations('marketing');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    const key = value.trim().toUpperCase();
    if (!key) return;
    const found = LOOKUP[key];
    // any unknown input resolves to a default "In Transit" demo shipment
    setResult(found ? { lr: key, ...found } : { lr: key, active: 2, route: 'Indore → Nagpur' });
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
            {t('trackTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-slate-300"
          >
            {t('trackSubtitle')}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleTrack}
            className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <FormInput
                name="lr"
                icon={Search}
                placeholder={t('trackPlaceholder')}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label={t('trackTitle')}
              />
            </div>
            <Button type="submit" variant="amber" size="lg" icon={Search}>
              {t('trackButton')}
            </Button>
          </motion.form>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.lr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="grid gap-8 lg:grid-cols-2"
              >
                {/* timeline */}
                <div className="card p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-brand-muted">{result.lr}</p>
                      <p className="mt-0.5 font-display text-lg font-semibold text-brand-navy">
                        {result.route}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <Truck className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="relative mt-8 pl-8">
                    <div className="absolute left-[11px] top-2 h-[calc(100%-1.5rem)] w-0.5 bg-brand-border" />
                    {STEPS.map((step, i) => {
                      const done = i < result.active;
                      const active = i === result.active;
                      return (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.12 }}
                          className="relative pb-8 last:pb-0"
                        >
                          <span
                            className={cn(
                              'absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white',
                              done && 'bg-brand-success',
                              active && 'bg-brand-blue',
                              !done && !active && 'bg-brand-border',
                            )}
                          >
                            {active && (
                              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-blue" />
                            )}
                            {i === STEPS.length - 1 && done ? (
                              <PackageCheck className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </span>
                          <p
                            className={cn(
                              'font-medium',
                              done || active ? 'text-brand-navy' : 'text-brand-muted',
                            )}
                          >
                            {step}
                          </p>
                          {active && (
                            <p className="mt-0.5 text-xs font-medium text-brand-blue">
                              Current status
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* map placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative min-h-[320px] overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy"
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <motion.path
                      d="M 50 250 C 150 120, 280 300, 420 90"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="3"
                      strokeDasharray="8 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, ease: 'easeInOut' }}
                    />
                  </svg>
                  <span className="absolute left-[50px] top-[250px] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                    <MapPin className="h-6 w-6 text-white drop-shadow" />
                  </span>
                  <motion.span
                    initial={{ left: 50, top: 250 }}
                    animate={{ left: 420, top: 90 }}
                    transition={{ duration: 1.6, ease: 'easeInOut' }}
                    className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-elevated"
                  >
                    <Truck className="h-4 w-4 text-brand-blue" />
                  </motion.span>
                  <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-brand-navy backdrop-blur">
                    Live route (demo)
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
