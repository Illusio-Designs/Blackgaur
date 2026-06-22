'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchList } from '@/lib/api';
import { mockTrips } from '@/lib/mock';

export function useTrips(params = {}) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => fetchList('/trips', params, mockTrips),
    staleTime: 30_000,
  });
}

export function useUpdateTripStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      try {
        const { data } = await api.patch(`/trips/${id}/status`, { status });
        return data;
      } catch {
        return { id, status, _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post('/trips', payload);
        return data;
      } catch {
        return { ...payload, id: Date.now(), _mock: true };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}
