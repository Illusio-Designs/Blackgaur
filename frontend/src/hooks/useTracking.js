'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchList } from '@/lib/api';

// Live GPS positions for vehicles with a configured device id.
// Refetches periodically so the map stays current.
export function useLiveTracking(params = {}) {
  return useQuery({
    queryKey: ['tracking-live', params],
    queryFn: () => fetchList('/tracking/live', params),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}
