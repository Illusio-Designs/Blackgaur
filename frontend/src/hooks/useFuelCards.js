'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockFuelCards, mockFuelTransactions } from '@/lib/mock';

export function useFuelCards(params = {}) {
  return useQuery({
    queryKey: ['fuel-cards', params],
    queryFn: () => fetchList('/fuel-cards', params, mockFuelCards),
    staleTime: 30_000,
  });
}

export function useFuelTransactions(params = {}) {
  return useQuery({
    queryKey: ['fuel-transactions', params],
    queryFn: () => fetchList('/fuel-transactions', params, mockFuelTransactions),
    staleTime: 30_000,
  });
}

export function useBlockFuelCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, block, reason }) => {
      try {
        const { data } = await api.post(
          `/fuel-cards/${id}/${block ? 'block' : 'unblock'}`,
          { reason },
        );
        return data;
      } catch {
        return { id, is_active: !block, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-cards'] }),
  });
}

export function useAssignFuelCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicle_id, driver_id }) => {
      try {
        const { data } = await api.patch(`/fuel-cards/${id}`, { vehicle_id, driver_id });
        return data;
      } catch {
        return { id, vehicle_id, driver_id, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-cards'] }),
  });
}
