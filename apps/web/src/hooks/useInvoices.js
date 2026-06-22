'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockInvoices } from '@/lib/mock';

export function useInvoices(params = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => fetchList('/invoices', params, mockInvoices),
    staleTime: 30_000,
  });
}

export function useApproveInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const { data } = await api.patch(`/invoices/${id}/approve`);
        return data;
      } catch {
        return { id, status: 'approved', _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const { data } = await api.post(`/invoices/${id}/send`);
        return data;
      } catch {
        return { id, status: 'sent', _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post('/invoices', payload);
        return data;
      } catch {
        return { ...payload, id: Date.now(), _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
