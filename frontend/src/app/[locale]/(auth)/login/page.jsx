'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import FormInput from '@/components/ui/FormInput';
import PhoneInput from '@/components/ui/PhoneInput';
import Button from '@/components/ui/Button';
import { useRequestOtp } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tr = useTranslations('roles');
  const router = useRouter();
  const requestOtp = useRequestOtp();

  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = mobile.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError(t('invalidMobile'));
      return;
    }
    setError('');
    try {
      await requestOtp.mutateAsync({ mobile: clean });
    } catch {
      // demo fallback still routes forward
    }
    router.push(`/verify-otp?mobile=${clean}&role=${role}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy">
        {t('loginTitle')}
      </h1>
      <p className="mt-2 text-sm text-brand-muted">{t('loginSubtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <PhoneInput
          name="mobile"
          label={t('mobileLabel')}
          country="IN"
          value={mobile}
          onChange={(digits) => {
            setMobile(digits);
            if (error) setError('');
          }}
          error={error}
        />

        <FormInput
          as="select"
          name="role"
          label={t('selectRole')}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {tr(r.value)}
            </option>
          ))}
        </FormInput>

        <Button
          type="submit"
          variant="amber"
          size="lg"
          loading={requestOtp.isPending}
          iconRight={<ArrowRight className="h-5 w-5" />}
          className="w-full"
        >
          {t('requestOtp')}
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-xs text-brand-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
        <span>{t('demoNotice')}</span>
      </div>
    </motion.div>
  );
}
