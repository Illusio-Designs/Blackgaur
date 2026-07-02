'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchList } from '@/lib/api';

// Available GPS provider adapters (for the fleet dropdown + settings).
export function useTrackingProviders() {
  return useQuery({
    queryKey: ['tracking-providers'],
    queryFn: () => fetchList('/tracking/providers'),
    staleTime: 30 * 60_000,
  });
}

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
