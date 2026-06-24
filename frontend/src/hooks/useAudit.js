'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchList } from '@/lib/api';

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchList('/audit-logs', params),
    staleTime: 30_000,
  });
}
