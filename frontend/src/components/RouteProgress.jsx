'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Thin top progress bar that animates on every route change, so navigation
 * always shows visible feedback (SaaS-style page-transition loader).
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="route-progress"
          className="fixed inset-x-0 top-0 z-[200] h-[3px] origin-left bg-gradient-to-r from-brand-blue via-brand-amber to-brand-blue shadow-[0_0_8px_rgba(26,86,219,0.5)]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ scaleX: { duration: 0.55, ease: 'easeOut' }, opacity: { duration: 0.2 } }}
        />
      )}
    </AnimatePresence>
  );
}
