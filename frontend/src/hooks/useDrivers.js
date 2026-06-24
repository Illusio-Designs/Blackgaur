'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchList } from '@/lib/api';

// Drivers are users with the driver role (GET /drivers).
export function useDrivers(params = {}) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => fetchList('/drivers', params),
    staleTime: 5 * 60_000,
  });
}
