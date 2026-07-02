// API-first mock fallback. When the backend is unreachable, fetchList/fetchOne
// return this demo data so the app is fully browsable standalone. When a real
// backend IS connected it always wins — this only fires on a failed request.

import {
  mockClients, mockVehicles, mockDrivers, mockTrips, mockExpenses, mockInvoices,
  mockFastagWallets, mockTollTransactions, mockFuelCards, mockFuelTransactions,
  mockUsers, mockRoles, mockAuditLogs, mockPayments, mockTdsJournal,
  mockDashboard, mockRevenueSeries, mockTollByVehicle, mockFuelByVehicle, mockTripStatusDist,
} from '@/lib/mock';

// Demo GPS positions so the live tracking map shows moving trucks offline.
export const mockLivePositions = [
  { vehicle_id: 1, registration_no: 'GJ-01-AB-1234', gps_device_id: '860123456789012', driver: { id: 11, name: 'Ramesh Yadav' }, latitude: 23.0225, longitude: 72.5714, speed_kmph: 54, heading: 210, recorded_at: new Date().toISOString(), trip: { id: 1, lr_number: 'LR-2024-25-0001', origin_city: 'Ahmedabad', destination_city: 'Mumbai' } },
  { vehicle_id: 3, registration_no: 'MH-12-EF-9012', gps_device_id: '860123456789034', driver: { id: 13, name: 'Dinesh Solanki' }, latitude: 19.0760, longitude: 72.8777, speed_kmph: 0, heading: 0, recorded_at: new Date(Date.now() - 3 * 60000).toISOString(), trip: { id: 4, lr_number: 'LR-2024-25-0004', origin_city: 'Delhi', destination_city: 'Mumbai' } },
  { vehicle_id: 2, registration_no: 'GJ-05-CD-5678', gps_device_id: '860123456789056', driver: { id: 12, name: 'Suresh Patil' }, latitude: 22.3072, longitude: 73.1812, speed_kmph: 62, heading: 95, recorded_at: new Date(Date.now() - 1 * 60000).toISOString(), trip: null },
];

const TRACKING_PROVIDERS = [
  { key: 'manual', label: 'Webhook / Manual push', mode: 'push' },
  { key: 'traccar', label: 'Traccar (self-hosted)', mode: 'pull' },
  { key: 'loconav', label: 'Loconav', mode: 'pull' },
  { key: 'fleetx', label: 'Fleetx', mode: 'pull' },
  { key: 'wialon', label: 'Wialon', mode: 'pull' },
  { key: 'mappls', label: 'Mappls (MapmyIndia)', mode: 'pull' },
  { key: 'generic', label: 'Generic REST', mode: 'pull' },
];

// Dashboard report in the snake_case shape the overview page consumes.
const dashboardFallback = {
  active_trips: mockDashboard.activeTrips,
  delivered_this_month: mockDashboard.deliveredThisMonth,
  pending_expenses: mockDashboard.pendingExpenses,
  revenue_this_month: mockDashboard.revenueThisMonth,
  fastag_spend: mockDashboard.fastagSpend,
  fuel_spend: mockDashboard.fuelSpend,
  fleet_utilisation: mockDashboard.fleetUtilisation,
  revenue_series: mockRevenueSeries,
  trip_status: mockTripStatusDist,
  toll_by_vehicle: mockTollByVehicle,
  fuel_by_vehicle: mockFuelByVehicle,
};

const LIST = {
  '/trips': mockTrips,
  '/clients': mockClients,
  '/vehicles': mockVehicles,
  '/invoices': mockInvoices,
  '/expenses': mockExpenses,
  '/fastag/wallets': mockFastagWallets,
  '/fastag/transactions': mockTollTransactions,
  '/fuel-cards': mockFuelCards,
  '/fuel-transactions': mockFuelTransactions,
  '/drivers': mockDrivers,
  '/payments': mockPayments,
  '/payments/tds-journal': mockTdsJournal,
  '/users': mockUsers,
  '/roles': mockRoles,
  '/audit-logs': mockAuditLogs,
  '/tracking/live': mockLivePositions,
  '/tracking/providers': TRACKING_PROVIDERS,
};

const ONE = {
  '/reports/dashboard': dashboardFallback,
  '/reports/finance': dashboardFallback,
  '/reports/fastag': dashboardFallback,
  '/reports/fuel': dashboardFallback,
};

export function listFallback(endpoint) {
  return LIST[endpoint];
}

export function oneFallback(endpoint) {
  return ONE[endpoint];
}
