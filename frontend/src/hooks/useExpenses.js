'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockExpenses } from '@/lib/mock';

export function useExpenses(params = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchList('/expenses', params, mockExpenses),
    staleTime: 30_000,
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }) => {
      try {
        const { data } = await api.patch(`/expenses/${id}/approve`, { note });
        return data;
      } catch {
        return { id, status: 'approved', _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useRejectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      try {
        const { data } = await api.patch(`/expenses/${id}/reject`, { reason });
        return data;
      } catch {
        return { id, status: 'rejected', reason, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
