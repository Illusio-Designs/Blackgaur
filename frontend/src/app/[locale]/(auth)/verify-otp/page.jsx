'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import OTPInput from '@/components/ui/OTPInput';
import Button from '@/components/ui/Button';
import { useVerifyOtp } from '@/hooks/useAuth';
import { roleHome } from '@/lib/auth';
import { mask } from '@/lib/utils';

function VerifyOtpInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();
  const verifyOtp = useVerifyOtp();

  const mobile = params.get('mobile') || '';
  const role = params.get('role') || 'admin';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const doVerify = async (code) => {
    if (code.length !== 6) {
      setError(t('otpSubtitle'));
      return;
    }
    setError('');
    try {
      await verifyOtp.mutateAsync({ mobile, otp: code, requestId: 'demo', role });
    } catch {
      // demo fallback already sets the session cookie inside the hook
    }
    // Success micro-animation, then route to the role dashboard.
    setVerified(true);
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      confetti({
        particleCount: 70,
        spread: 72,
        startVelocity: 38,
        origin: { y: 0.4 },
        colors: ['#1A56DB', '#D97706', '#065F46'],
      });
    }
    setTimeout(() => router.push(roleHome(role)), 1300);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(60);
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* expanding pulse ring */}
          <motion.span
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-brand-success/30"
          />
          {/* success disc */}
          <motion.span
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-success text-white shadow-elevated"
          >
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 320, damping: 14 }}
            >
              <Check className="h-11 w-11" strokeWidth={3} />
            </motion.span>
          </motion.span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 font-display text-3xl font-bold tracking-tight text-brand-navy"
        >
          {t('verified')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-2 flex items-center gap-2 text-sm text-brand-muted"
        >
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-blue/30 border-t-brand-blue" />
          {t('redirecting')}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
        <ShieldCheck className="h-6 w-6" />
      </span>

      <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-brand-navy">
        {t('otpTitle')}
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        {t('otpSubtitle')}
        {mobile && <span className="ml-1 font-medium text-brand-navy">{mask(mobile, 4)}</span>}
      </p>

      <div className="mt-8">
        <p className="label-base">{t('otpLabel')}</p>
        <div className="mt-2">
          <OTPInput
            length={6}
            onChange={(code) => {
              setOtp(code);
              if (error) setError('');
            }}
            onComplete={doVerify}
          />
        </div>
        {error && <p className="mt-3 text-center text-xs font-medium text-brand-danger">{error}</p>}
      </div>

      <Button
        variant="amber"
        size="lg"
        loading={verifyOtp.isPending}
        onClick={() => doVerify(otp)}
        className="mt-8 w-full"
      >
        {t('verify')}
      </Button>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-brand-navy transition hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('changeNumber')}
        </Link>
        {seconds > 0 ? (
          <span className="text-brand-muted">{t('resendIn', { seconds })}</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="font-medium text-brand-blue transition hover:underline"
          >
            {t('resend')}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpInner />
    </Suspense>
  );
}
