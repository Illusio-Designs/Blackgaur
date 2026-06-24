'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOne } from '@/lib/api';

// /reports/dashboard returns the rich landing-page shape (snake-cased by the
// API helper): active_trips, delivered_this_month, pending_expenses,
// revenue_this_month, fastag_spend, fuel_spend, fleet_utilisation,
// revenue_series[], trip_status[], toll_by_vehicle[], fuel_by_vehicle[].
export function useDashboardReport(params = {}) {
  return useQuery({
    queryKey: ['report-dashboard', params],
    queryFn: () => fetchOne('/reports/dashboard'),
    staleTime: 60_000,
  });
}

export function useFinanceReport(params = {}) {
  return useQuery({
    queryKey: ['report-finance', params],
    queryFn: () => fetchOne('/reports/finance'),
    staleTime: 60_000,
  });
}

export function useFastagReport(params = {}) {
  return useQuery({
    queryKey: ['report-fastag', params],
    queryFn: () => fetchOne('/reports/fastag'),
    staleTime: 60_000,
  });
}

export function useFuelReport(params = {}) {
  return useQuery({
    queryKey: ['report-fuel', params],
    queryFn: () => fetchOne('/reports/fuel'),
    staleTime: 60_000,
  });
}
