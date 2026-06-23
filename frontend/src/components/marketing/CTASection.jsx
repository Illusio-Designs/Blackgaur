'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import { useBranding } from '@/hooks/useBranding';

export default function CTASection() {
  const t = useTranslations('marketing');
  const { branding } = useBranding();

  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-blue/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-amber/20 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('ctaTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              {t('ctaSubtitle', { company: branding.companyName })}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/quote">
                <Button variant="amber" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                  {branding.content.hero.ctaPrimary}
                </Button>
              </Link>
              <Link href="/track">
                <Button
                  size="lg"
                  icon={MapPin}
                  className="border border-white/25 bg-white/5 text-white hover:bg-white/10"
                >
                  {branding.content.hero.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
