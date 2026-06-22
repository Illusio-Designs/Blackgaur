'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockClients } from '@/lib/mock';

export function useClients(params = {}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchList('/clients', params, mockClients),
    staleTime: 60_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post('/clients', payload);
        return data;
      } catch {
        return { ...payload, id: Date.now(), _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
