'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';

export function useVehicles(params = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => fetchList('/vehicles', { include: 'driver,fastagWallet', ...params }),
    staleTime: 30_000,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/vehicles', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
