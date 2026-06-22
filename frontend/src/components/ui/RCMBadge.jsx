'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function RCMBadge({ isRcm }) {
  const t = useTranslations('invoices');
  const [open, setOpen] = useState(false);

  if (!isRcm) {
    return (
      <span className="inline-flex items-center rounded-full border border-brand-border bg-white px-2 py-0.5 text-[11px] font-medium text-brand-muted">
        GST
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="RCM"
        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-brand-amber ring-1 ring-brand-amber/30"
      >
        RCM
        <Info className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg bg-brand-navy px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-elevated"
          >
            {t('rcmTooltip')}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-brand-navy" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
