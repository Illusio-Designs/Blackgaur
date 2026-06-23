'use client';

import { cn } from '@/lib/utils';

// Base shimmer block built on the global `.skeleton` class (globals.css).
export default function Skeleton({ className, rounded = false }) {
  return <div className={cn('skeleton h-4 w-full', rounded && 'rounded-full', className)} />;
}

// A stack of text lines; the last line is shortened for a natural look.
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

// A circular shimmer (avatars, icons).
export function SkeletonCircle({ size = 40, className }) {
  return (
    <div
      className={cn('skeleton rounded-full', className)}
      style={{ width: size, height: size }}
    />
  );
}
