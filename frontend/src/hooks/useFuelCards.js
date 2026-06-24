'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';

export function useFuelCards(params = {}) {
  return useQuery({
    queryKey: ['fuel-cards', params],
    queryFn: () => fetchList('/fuel-cards', { include: 'vehicle,driver', ...params }),
    staleTime: 30_000,
  });
}

export function useFuelTransactions(params = {}) {
  return useQuery({
    queryKey: ['fuel-transactions', params],
    queryFn: () => fetchList('/fuel-transactions', { include: 'vehicle,trip', ...params }),
    staleTime: 30_000,
  });
}

export function useBlockFuelCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, block, reason }) => {
      const { data } = await api.post(`/fuel-cards/${id}/${block ? 'block' : 'unblock'}`, { reason });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-cards'] }),
  });
}

export function useAssignFuelCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicle_id, driver_id }) => {
      const { data } = await api.patch(`/fuel-cards/${id}`, { vehicle_id, driver_id });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-cards'] }),
  });
}
