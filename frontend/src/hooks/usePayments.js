'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';

export function usePayments(params = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => fetchList('/payments', params),
    staleTime: 30_000,
  });
}

export function useTdsJournal(params = {}) {
  return useQuery({
    queryKey: ['tds-journal', params],
    queryFn: () => fetchList('/payments/tds-journal', params),
    staleTime: 30_000,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/payments', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['tds-journal'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
