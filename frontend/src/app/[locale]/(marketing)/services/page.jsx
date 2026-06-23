'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import { serviceIcon } from '@/components/marketing/ServicesGrid';
import WhyChooseUs from '@/components/marketing/WhyChooseUs';
import { useBranding } from '@/hooks/useBranding';
import { stagger, staggerItem } from '@/lib/animations';

export default function ServicesPage() {
  const t = useTranslations('marketing');
  const tn = useTranslations('nav');
  const { branding } = useBranding();
  const services = branding.content.services || [];

  return (
    <div className="bg-white">
      <section className="bg-brand-navy px-4 pt-36 pb-20 text-center text-white">
        <div className="container-page">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {t('servicesTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
          >
            {t('servicesSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* detailed service cards */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((s) => {
              const { Icon, tint } = serviceIcon(s.key);
              return (
                <motion.div
                  key={s.key || s.title}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="card flex flex-col p-7 transition-shadow hover:shadow-elevated"
                >
                  <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${tint}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-brand-navy">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">
                    {s.description}
                  </p>
                  <Link
                    href="/quote"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue transition hover:gap-2.5"
                  >
                    {tn('getQuote')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <WhyChooseUs />

      {/* closing band */}
      <section className="bg-brand-surface py-20">
        <div className="container-page">
          <div className="card flex flex-col items-center gap-6 p-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-navy">
                {t('servicesCtaTitle')}
              </h2>
              <p className="mt-2 max-w-xl text-brand-muted">{t('servicesCtaSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-brand-success">
              <CheckCircle2 className="h-5 w-5" />
              {t('servicesCtaNote')}
              <Link href="/quote" className="ml-2">
                <Button variant="amber" size="lg">
                  {tn('getQuote')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
