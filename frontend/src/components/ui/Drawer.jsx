'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { drawerSlideRight, drawerSlideLeft, overlayFade } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Width of the aside panel per size token.
const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
};

/**
 * Drawer — a slide-in aside panel used for add/edit flows (replaces centered modals).
 * Drop-in compatible with <Modal />: { open, onClose, title, size, children, footer }.
 * Extra props: side ('right' | 'left'), description.
 */
export default function Drawer({
  open,
  onClose,
  title,
  description,
  size = 'md',
  side = 'right',
  children,
  footer,
}) {
  const panelRef = useRef(null);

  // Focus trap + Escape + body scroll lock (section 15: focus trap).
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      clearTimeout(t);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const variants = side === 'left' ? drawerSlideLeft : drawerSlideRight;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            {...overlayFade}
            className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            {...variants}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'absolute top-0 flex h-full w-full flex-col bg-white shadow-elevated',
              SIZES[size],
              side === 'left' ? 'left-0' : 'right-0',
            )}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-brand-navy">{title}</h3>
                  {description && (
                    <p className="mt-0.5 text-sm text-brand-muted">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="-mr-1.5 rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-surface hover:text-brand-navy"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-brand-border bg-brand-surface/50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
