'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockVehicles } from '@/lib/mock';

export function useVehicles(params = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => fetchList('/vehicles', params, mockVehicles),
    staleTime: 30_000,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post('/vehicles', payload);
        return data;
      } catch {
        return { ...payload, id: Date.now(), _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
