'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// TanStack Table v8 wrapper (section 15). Staggered row fade-up (section 11.2).
export default function DataTable({
  columns,
  data = [],
  pagination,
  onPageChange,
  emptyMessage,
  loading = false,
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
            {loading ? (
              Array.from({ length: 6 }).map((_, r) => (
                <tr key={`sk-${r}`} className="border-b border-brand-border/70">
                  {columns.map((col, c) => (
                    <td key={c} className="px-4 py-3.5">
                      <Skeleton className={cn('h-4', c === 0 ? 'w-24' : 'w-full max-w-[140px]')} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
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

      {pagination && !loading && (
        <div className="border-t border-brand-border px-4 py-3">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages || 1}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
