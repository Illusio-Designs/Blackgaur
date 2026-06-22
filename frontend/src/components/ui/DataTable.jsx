'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// TanStack Table v8 wrapper (section 15). Staggered row fade-up (section 11.2).
export default function DataTable({
  columns,
  data = [],
  pagination,
  onPageChange,
  emptyMessage,
  className,
}) {
  const t = useTranslations('common');
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-brand-border bg-brand-surface/60">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold text-brand-muted"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1.5',
                            canSort && 'cursor-pointer hover:text-brand-navy',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort &&
                            (sorted === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            ))}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-brand-muted"
                >
                  {emptyMessage || t('noData')}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 15) * 0.03 }}
                  className="border-b border-brand-border/70 transition hover:bg-brand-surface/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-brand-text">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-brand-border px-4 py-3 text-sm text-brand-muted">
          <span>
            {t('page')} {pagination.page} {t('of')} {pagination.totalPages || 1}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="btn-focus rounded-lg border border-brand-border bg-white p-1.5 disabled:opacity-40"
              aria-label={t('previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="btn-focus rounded-lg border border-brand-border bg-white p-1.5 disabled:opacity-40"
              aria-label={t('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
