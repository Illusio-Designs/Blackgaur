'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchOne } from '@/lib/api';
import { DEFAULT_CONFIG, CONFIG_QUERY_KEY, mergeConfig } from '@/lib/config';

export { DEFAULT_CONFIG, CONFIG_QUERY_KEY };

// GET /v1/settings/config (admin) with default fallback so the page works
// standalone with no backend.
export function useConfig() {
  const query = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => fetchOne('/settings/config', DEFAULT_CONFIG),
    staleTime: 5 * 60_000,
    placeholderData: DEFAULT_CONFIG,
  });
  return { ...query, config: mergeConfig(query.data) };
}

// PUT /v1/settings/config (admin, partial deep-merge). Falls back to an
// optimistic cache write so the hub stays demoable with no backend.
export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.put('/settings/config', payload);
        return data?.data ?? data;
      } catch {
        // Demo fallback — deep-merge the patch onto the current cache value.
        const current = mergeConfig(qc.getQueryData(CONFIG_QUERY_KEY));
        return mergeConfig({
          company: { ...current.company, ...(payload.company || {}) },
          tax: { ...current.tax, ...(payload.tax || {}) },
          integrations: { ...current.integrations, ...(payload.integrations || {}) },
          alerts: { ...current.alerts, ...(payload.alerts || {}) },
        });
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(CONFIG_QUERY_KEY, mergeConfig(data));
      qc.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
    },
  });
}
