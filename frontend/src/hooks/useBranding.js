'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchOne } from '@/lib/api';
import { DEFAULT_BRANDING, BRANDING_QUERY_KEY, mergeBranding } from '@/lib/branding';

export { DEFAULT_BRANDING, BRANDING_QUERY_KEY };

// GET /v1/branding (public) with default fallback (shared branding contract).
export function useBranding() {
  const query = useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () => fetchOne('/branding', DEFAULT_BRANDING),
    staleTime: 5 * 60_000,
    placeholderData: DEFAULT_BRANDING,
  });
  return { ...query, branding: mergeBranding(query.data) };
}

// PUT /v1/settings/branding (admin). Falls back to optimistic cache write so the
// theme + preview stay demoable with no backend.
export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.put('/settings/branding', payload);
        return data?.data ?? data;
      } catch {
        // Demo fallback — merge onto the current cache value.
        const current = mergeBranding(qc.getQueryData(BRANDING_QUERY_KEY));
        return mergeBranding({ ...current, ...payload });
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(BRANDING_QUERY_KEY, mergeBranding(data));
      qc.invalidateQueries({ queryKey: BRANDING_QUERY_KEY });
    },
  });
}

// POST /v1/settings/branding/logo (admin, multipart). Returns the stored URL, or an
// object URL fallback so the preview works standalone.
export function useUploadLogo() {
  return useMutation({
    mutationFn: async ({ file, variant }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('variant', variant);
      try {
        const { data } = await api.post('/settings/branding/logo', fd, {
          params: { variant },
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data?.data?.url ?? data?.url ?? data;
      } catch {
        return typeof URL !== 'undefined' ? URL.createObjectURL(file) : '';
      }
    },
  });
}
