'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockFastagWallets, mockTollTransactions } from '@/lib/mock';

export function useFastagWallets(params = {}) {
  return useQuery({
    queryKey: ['fastag-wallets', params],
    queryFn: () => fetchList('/fastag/wallets', params, mockFastagWallets),
    staleTime: 30_000,
  });
}

export function useTollTransactions(params = {}) {
  return useQuery({
    queryKey: ['fastag-transactions', params],
    queryFn: () => fetchList('/fastag/transactions', params, mockTollTransactions),
    staleTime: 30_000,
  });
}

export function useSyncFastag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const { data } = await api.post(`/fastag/wallets/${id}/sync-balance`);
        return data;
      } catch {
        await new Promise((r) => setTimeout(r, 900));
        return { id, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fastag-wallets'] }),
  });
}

export function useRechargeFastag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }) => {
      try {
        const { data } = await api.post(`/fastag/wallets/${id}/recharge`, { amount });
        return data;
      } catch {
        return { id, amount, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fastag-wallets'] }),
  });
}
