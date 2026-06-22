'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOne } from '@/lib/api';
import {
  mockDashboard,
  mockRevenueSeries,
  mockTollByVehicle,
  mockFuelByVehicle,
  mockTripStatusDist,
} from '@/lib/mock';

export function useDashboardReport(params = {}) {
  return useQuery({
    queryKey: ['report-dashboard', params],
    queryFn: () =>
      fetchOne('/reports/dashboard', {
        ...mockDashboard,
        revenueSeries: mockRevenueSeries,
        tollByVehicle: mockTollByVehicle,
        fuelByVehicle: mockFuelByVehicle,
        tripStatus: mockTripStatusDist,
      }),
    staleTime: 60_000,
  });
}

export function useFinanceReport(params = {}) {
  return useQuery({
    queryKey: ['report-finance', params],
    queryFn: () => fetchOne('/reports/finance', { series: mockRevenueSeries }),
    staleTime: 60_000,
  });
}

export function useFastagReport(params = {}) {
  return useQuery({
    queryKey: ['report-fastag', params],
    queryFn: () => fetchOne('/reports/fastag', { byVehicle: mockTollByVehicle }),
    staleTime: 60_000,
  });
}

export function useFuelReport(params = {}) {
  return useQuery({
    queryKey: ['report-fuel', params],
    queryFn: () => fetchOne('/reports/fuel', { byVehicle: mockFuelByVehicle }),
    staleTime: 60_000,
  });
}
