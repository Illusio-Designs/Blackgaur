'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useEffect } from 'react';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const TONE = {
  success: 'text-brand-success',
  error: 'text-brand-danger',
  info: 'text-brand-blue',
  warning: 'text-brand-amber',
};

function ToastItem({ toast }) {
  const dismiss = useUiStore((s) => s.dismissToast);
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-brand-border bg-white p-3.5 shadow-elevated"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TONE[toast.type] || TONE.info}`} />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-semibold text-brand-navy">{toast.title}</p>
        )}
        {toast.message && (
          <p className="mt-0.5 text-sm text-brand-muted">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="text-brand-muted transition hover:text-brand-navy"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Convenience hook
export function useToast() {
  const push = useUiStore((s) => s.pushToast);
  return {
    toast: push,
    success: (title, message) => push({ type: 'success', title, message }),
    error: (title, message) => push({ type: 'error', title, message }),
    info: (title, message) => push({ type: 'info', title, message }),
    warning: (title, message) => push({ type: 'warning', title, message }),
  };
}
