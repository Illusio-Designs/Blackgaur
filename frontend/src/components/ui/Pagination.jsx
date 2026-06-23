'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// Build a compact page list with ellipsis: 1 … 4 5 [6] 7 8 … 20
function buildPages(page, totalPages) {
  const pages = [];
  const push = (p) => pages.push(p);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) push(i);
    return pages;
  }
  push(1);
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) push('left-ellipsis');
  for (let i = start; i <= end; i += 1) push(i);
  if (end < totalPages - 1) push('right-ellipsis');
  push(totalPages);
  return pages;
}

/**
 * Pagination — Prev/Next + numbered pages with ellipsis.
 * props { page, totalPages, hasNext, hasPrev, onPageChange }
 */
export default function Pagination({ page = 1, totalPages = 1, hasNext, hasPrev, onPageChange }) {
  const t = useTranslations('common');
  const total = Math.max(1, totalPages);
  const canPrev = hasPrev != null ? hasPrev : page > 1;
  const canNext = hasNext != null ? hasNext : page < total;
  const pages = buildPages(page, total);

  const go = (p) => {
    if (p < 1 || p > total || p === page) return;
    onPageChange?.(p);
  };

  return (
    <nav
      className="flex items-center justify-between gap-3 text-sm text-brand-muted"
      aria-label={t('page')}
    >
      <span>
        {t('page')} {page} {t('of')} {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => go(page - 1)}
          className="btn-focus rounded-lg border border-brand-border bg-white p-1.5 transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('previous')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`${p}-${i}`} className="px-1.5 text-brand-muted/70">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => go(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'btn-focus h-8 min-w-8 rounded-lg border px-2 text-sm font-medium transition',
                  p === page
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-border bg-white text-brand-text hover:bg-brand-surface',
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => go(page + 1)}
          className="btn-focus rounded-lg border border-brand-border bg-white p-1.5 transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
