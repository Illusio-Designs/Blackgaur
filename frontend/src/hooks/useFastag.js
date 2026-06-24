'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';

export function useFastagWallets(params = {}) {
  return useQuery({
    queryKey: ['fastag-wallets', params],
    queryFn: () => fetchList('/fastag/wallets', params),
    staleTime: 30_000,
  });
}

export function useTollTransactions(params = {}) {
  return useQuery({
    queryKey: ['fastag-transactions', params],
    queryFn: () => fetchList('/fastag/transactions', { include: 'vehicle,trip', ...params }),
    staleTime: 30_000,
  });
}

export function useSyncFastag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { data } = await api.post(`/fastag/wallets/${id}/sync-balance`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fastag-wallets'] }),
  });
}

export function useRechargeFastag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }) => {
      const { data } = await api.post(`/fastag/wallets/${id}/recharge`, { amount });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fastag-wallets'] }),
  });
}
