'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchList } from '@/lib/api';

export function useRoles(params = {}) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => fetchList('/roles', params),
    staleTime: 5 * 60_000,
  });
}
