'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export default function Spinner({ size = 'md', className, label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex text-brand-blue', className)}>
      <Loader2 className={cn('animate-spin', SIZES[size] || SIZES.md)} />
    </span>
  );
}
