// Representative mock data so every page renders standalone (no backend).

export const mockClients = [
  { id: 1, company_name: 'Adani Logistics Ltd', gstin: '24AAACA1234A1Z5', pan: 'AAACA1234A', state_code: '24', contact_name: 'Rohan Mehta', contact_mobile: '9824012345', billing_address: 'Shantigram, Ahmedabad, Gujarat', credit_days: 30, rcm_applicable: true, account_manager_id: 4, outstanding: 480000 },
  { id: 2, company_name: 'Tata Steel Distribution', gstin: '27AAACT2727Q1ZW', pan: 'AAACT2727Q', state_code: '27', contact_name: 'Sunita Rao', contact_mobile: '9920098765', billing_address: 'Bandra Kurla Complex, Mumbai, Maharashtra', credit_days: 45, rcm_applicable: true, account_manager_id: 4, outstanding: 1250000 },
  { id: 3, company_name: 'Reliance Retail', gstin: '24AAACR5055K1Z7', pan: 'AAACR5055K', state_code: '24', contact_name: 'Amit Patel', contact_mobile: '9879045678', billing_address: 'Navi Mumbai, Maharashtra', credit_days: 15, rcm_applicable: false, account_manager_id: 4, outstanding: 0 },
  { id: 4, company_name: 'Maruti Suzuki Parts', gstin: '06AAACM4598R1ZX', pan: 'AAACM4598R', state_code: '06', contact_name: 'Vikram Singh', contact_mobile: '9810076543', billing_address: 'Gurugram, Haryana', credit_days: 60, rcm_applicable: true, account_manager_id: 4, outstanding: 320000 },
  { id: 5, company_name: 'Asian Paints Depot', gstin: '24AAACA6666P1Z2', pan: 'AAACA6666P', state_code: '24', contact_name: 'Priya Joshi', contact_mobile: '9825011223', billing_address: 'Vadodara, Gujarat', credit_days: 7, rcm_applicable: false, account_manager_id: 4, outstanding: 95000 },
];

export const mockVehicles = [
  { id: 1, registration_no: 'GJ-01-AB-1234', vehicle_type: 'Truck', capacity_tons: 16, model: 'Tata Signa 4825', owner_type: 'own', is_available: false, fastag_tag_id: '34161FA8203B1C29D7' },
  { id: 2, registration_no: 'GJ-05-CD-5678', vehicle_type: 'Trailer', capacity_tons: 25, model: 'Ashok Leyland 3520', owner_type: 'own', is_available: true, fastag_tag_id: '34161FA8203B1C30E2' },
  { id: 3, registration_no: 'MH-12-EF-9012', vehicle_type: 'Truck', capacity_tons: 18, model: 'BharatBenz 2823', owner_type: 'attached', is_available: false, fastag_tag_id: '34161FA8203B1C31F8' },
  { id: 4, registration_no: 'GJ-18-GH-3456', vehicle_type: 'Mini-truck', capacity_tons: 7, model: 'Eicher Pro 2049', owner_type: 'own', is_available: true, fastag_tag_id: '34161FA8203B1C320A' },
];

export const mockDrivers = [
  { id: 11, name: 'Ramesh Yadav', mobile: '9824111111', role: 'driver' },
  { id: 12, name: 'Suresh Patil', mobile: '9824222222', role: 'driver' },
  { id: 13, name: 'Mahesh Kumar', mobile: '9824333333', role: 'driver' },
  { id: 14, name: 'Dinesh Solanki', mobile: '9824444444', role: 'driver' },
];

const baseTrip = (over) => ({
  vehicle: mockVehicles[0],
  driver: mockDrivers[0],
  client: mockClients[0],
  origin_city: 'Ahmedabad',
  destination_city: 'Mumbai',
  cargo_type: 'Industrial goods',
  cargo_weight_kg: 14500,
  freight_charges: 48000,
  estimated_fastag_toll: 3200,
  actual_fastag_toll: 0,
  planned_departure: '2026-06-22T08:00:00',
  status: 'planned',
  eway_bill_no: 'EWB-310024889',
  ...over,
});

export const mockTrips = [
  baseTrip({ id: 1, lr_number: 'LR-2024-25-0001', status: 'planned', origin_city: 'Ahmedabad', destination_city: 'Mumbai', client: mockClients[0], vehicle: mockVehicles[0], driver: mockDrivers[0], freight_charges: 48000 }),
  baseTrip({ id: 2, lr_number: 'LR-2024-25-0002', status: 'planned', origin_city: 'Surat', destination_city: 'Pune', client: mockClients[2], vehicle: mockVehicles[3], driver: mockDrivers[1], freight_charges: 36000 }),
  baseTrip({ id: 3, lr_number: 'LR-2024-25-0003', status: 'loading', origin_city: 'Vadodara', destination_city: 'Indore', client: mockClients[4], vehicle: mockVehicles[1], driver: mockDrivers[2], freight_charges: 28000 }),
  baseTrip({ id: 4, lr_number: 'LR-2024-25-0004', status: 'in_transit', origin_city: 'Ahmedabad', destination_city: 'Delhi', client: mockClients[3], vehicle: mockVehicles[2], driver: mockDrivers[3], actual_fastag_toll: 4120, actual_departure: '2026-06-21T06:30:00', freight_charges: 72000 }),
  baseTrip({ id: 5, lr_number: 'LR-2024-25-0005', status: 'in_transit', origin_city: 'Rajkot', destination_city: 'Nagpur', client: mockClients[1], vehicle: mockVehicles[0], driver: mockDrivers[0], actual_fastag_toll: 2890, actual_departure: '2026-06-21T09:00:00', freight_charges: 58000 }),
  baseTrip({ id: 6, lr_number: 'LR-2024-25-0006', status: 'delivered', origin_city: 'Mumbai', destination_city: 'Ahmedabad', client: mockClients[0], vehicle: mockVehicles[1], driver: mockDrivers[1], actual_fastag_toll: 3050, actual_arrival: '2026-06-20T18:00:00', freight_charges: 45000 }),
  baseTrip({ id: 7, lr_number: 'LR-2024-25-0007', status: 'delivered', origin_city: 'Pune', destination_city: 'Surat', client: mockClients[2], vehicle: mockVehicles[3], driver: mockDrivers[2], actual_fastag_toll: 2400, actual_arrival: '2026-06-19T20:00:00', freight_charges: 33000 }),
  baseTrip({ id: 8, lr_number: 'LR-2024-25-0008', status: 'cancelled', origin_city: 'Indore', destination_city: 'Jaipur', client: mockClients[3], vehicle: mockVehicles[2], driver: mockDrivers[3], freight_charges: 41000 }),
];

export const mockExpenses = [
  { id: 1, trip_id: 4, lr_number: 'LR-2024-25-0004', driver: mockDrivers[3], expense_type: 'toll', amount: 480, description: 'Vadodara plaza', expense_date: '2026-06-21', is_fastag_synced: true, status: 'auto_approved', receipt_url: null },
  { id: 2, trip_id: 4, lr_number: 'LR-2024-25-0004', driver: mockDrivers[3], expense_type: 'bata', amount: 1200, description: 'Driver allowance 2 days', expense_date: '2026-06-21', is_fastag_synced: false, status: 'pending', receipt_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600' },
  { id: 3, trip_id: 5, lr_number: 'LR-2024-25-0005', driver: mockDrivers[0], expense_type: 'fuel', amount: 18400, description: 'Diesel fill 200L', expense_date: '2026-06-21', is_fuelcard_synced: true, status: 'auto_approved', receipt_url: null },
  { id: 4, trip_id: 5, lr_number: 'LR-2024-25-0005', driver: mockDrivers[0], expense_type: 'loading', amount: 2500, description: 'Loading labour at Rajkot', expense_date: '2026-06-21', status: 'pending', receipt_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600' },
  { id: 5, trip_id: 6, lr_number: 'LR-2024-25-0006', driver: mockDrivers[1], expense_type: 'repair', amount: 4300, description: 'Tyre puncture + spare', expense_date: '2026-06-20', status: 'pending', receipt_url: 'https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?w=600' },
  { id: 6, trip_id: 6, lr_number: 'LR-2024-25-0006', driver: mockDrivers[1], expense_type: 'halting', amount: 800, description: 'Overnight halt', expense_date: '2026-06-20', status: 'rejected', rejected_reason: 'Not pre-approved', receipt_url: null },
  { id: 7, trip_id: 7, lr_number: 'LR-2024-25-0007', driver: mockDrivers[2], expense_type: 'unloading', amount: 1800, description: 'Unloading at Surat depot', expense_date: '2026-06-19', status: 'pending', receipt_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600' },
];

export const mockInvoices = [
  { id: 1, invoice_number: 'INV-2024-25-0001', invoice_type: 'outward', client: mockClients[0], freight_amount: 48000, subtotal: 50500, is_rcm: true, igst_amount: 0, cgst_amount: 0, sgst_amount: 0, tds_amount: 1010, total_amount: 49490, status: 'sent', due_date: '2026-07-22', client_state_code: '24' },
  { id: 2, invoice_number: 'INV-2024-25-0002', invoice_type: 'outward', client: mockClients[2], freight_amount: 36000, subtotal: 36000, is_rcm: false, igst_amount: 1800, cgst_amount: 0, sgst_amount: 0, tds_amount: 0, total_amount: 37800, status: 'paid', due_date: '2026-06-15', paid_at: '2026-06-12', client_state_code: '27' },
  { id: 3, invoice_number: 'INV-2024-25-0003', invoice_type: 'outward', client: mockClients[1], freight_amount: 58000, subtotal: 61500, is_rcm: true, igst_amount: 0, cgst_amount: 0, sgst_amount: 0, tds_amount: 1230, total_amount: 60270, status: 'pending_approval', due_date: '2026-08-05', client_state_code: '27' },
  { id: 4, invoice_number: 'INV-2024-25-0004', invoice_type: 'outward', client: mockClients[3], freight_amount: 72000, subtotal: 75000, is_rcm: true, igst_amount: 0, cgst_amount: 0, sgst_amount: 0, tds_amount: 1500, total_amount: 73500, status: 'overdue', due_date: '2026-06-01', client_state_code: '06' },
  { id: 5, invoice_number: 'INV-2024-25-0005', invoice_type: 'outward', client: mockClients[4], freight_amount: 28000, subtotal: 30500, is_rcm: false, igst_amount: 0, cgst_amount: 762.5, sgst_amount: 762.5, tds_amount: 0, total_amount: 32025, status: 'draft', due_date: '2026-06-30', client_state_code: '24' },
];

export const mockFastagWallets = [
  { id: 1, vehicle: mockVehicles[0], tag_id: '34161FA8203B1C29D7', tag_issuer: 'HDFC', linked_mobile: '9824012345', balance: 142, low_balance_alert: 200, is_active: true, balance_synced_at: '2026-06-22T07:45:00' },
  { id: 2, vehicle: mockVehicles[1], tag_id: '34161FA8203B1C30E2', tag_issuer: 'SBI', linked_mobile: '9824012345', balance: 3850, low_balance_alert: 200, is_active: true, balance_synced_at: '2026-06-22T07:45:00' },
  { id: 3, vehicle: mockVehicles[2], tag_id: '34161FA8203B1C31F8', tag_issuer: 'ICICI', linked_mobile: '9824012345', balance: 89, low_balance_alert: 200, is_active: true, balance_synced_at: '2026-06-22T07:45:00' },
  { id: 4, vehicle: mockVehicles[3], tag_id: '34161FA8203B1C320A', tag_issuer: 'Paytm', linked_mobile: '9824012345', balance: 5210, low_balance_alert: 200, is_active: true, balance_synced_at: '2026-06-22T07:45:00' },
];

export const mockTollTransactions = [
  { id: 1, vehicle: mockVehicles[2], trip_id: 4, transaction_id: 'TXN8842210', plaza_name: 'Bharthana Toll Plaza', highway: 'NH-48', amount: 230, balance_after: 89, transaction_at: '2026-06-21T11:20:00', direction: 'single', vehicle_class: 'VC7' },
  { id: 2, vehicle: mockVehicles[0], trip_id: 5, transaction_id: 'TXN8842288', plaza_name: 'Choryasi Plaza', highway: 'NH-48', amount: 185, balance_after: 142, transaction_at: '2026-06-21T13:05:00', direction: 'single', vehicle_class: 'VC7' },
  { id: 3, vehicle: mockVehicles[2], trip_id: 4, transaction_id: 'TXN8842341', plaza_name: 'Vadodara Plaza', highway: 'NE-1', amount: 320, balance_after: 89, transaction_at: '2026-06-21T15:42:00', direction: 'single', vehicle_class: 'VC7' },
  { id: 4, vehicle: mockVehicles[1], trip_id: null, transaction_id: 'TXN8842399', plaza_name: 'Bagodara Plaza', highway: 'SH-1', amount: 145, balance_after: 3850, transaction_at: '2026-06-21T18:10:00', direction: 'single', vehicle_class: 'VC5' },
];

export const mockFuelCards = [
  { id: 1, card_number: '6071520012341234', card_type: 'hpcl_fleetcard', vehicle: mockVehicles[0], driver: mockDrivers[0], balance: 18400, monthly_limit: 80000, monthly_spend: 54200, per_txn_limit: 25000, allowed_products: ['HSD'], is_active: true },
  { id: 2, card_number: '6071520056785678', card_type: 'iocl_xtrarewards', vehicle: mockVehicles[1], driver: mockDrivers[1], balance: 9200, monthly_limit: 60000, monthly_spend: 41800, per_txn_limit: 20000, allowed_products: ['HSD', 'MS'], is_active: true },
  { id: 3, card_number: '6071520099019901', card_type: 'bpcl_smartfleet', vehicle: mockVehicles[2], driver: mockDrivers[3], balance: 2100, monthly_limit: 70000, monthly_spend: 68500, per_txn_limit: 22000, allowed_products: ['HSD'], is_active: false },
];

export const mockFuelTransactions = [
  { id: 1, fuel_card_id: 1, vehicle: mockVehicles[0], trip_id: 5, transaction_id: 'FTX55120', fuel_station_name: 'HP Highway Plaza', fuel_station_city: 'Rajkot', product_type: 'HSD', quantity_ltr: 200, rate_per_ltr: 92, amount: 18400, odometer_km: 184320, transaction_at: '2026-06-21T07:30:00' },
  { id: 2, fuel_card_id: 2, vehicle: mockVehicles[1], trip_id: 6, transaction_id: 'FTX55188', fuel_station_name: 'IOCL Service Station', fuel_station_city: 'Mumbai', product_type: 'HSD', quantity_ltr: 150, rate_per_ltr: 91.5, amount: 13725, odometer_km: 221050, transaction_at: '2026-06-20T16:10:00' },
  { id: 3, fuel_card_id: 1, vehicle: mockVehicles[0], trip_id: null, transaction_id: 'FTX55244', fuel_station_name: 'HP Bagodara', fuel_station_city: 'Ahmedabad', product_type: 'HSD', quantity_ltr: 120, rate_per_ltr: 92.2, amount: 11064, odometer_km: 184780, transaction_at: '2026-06-22T06:00:00' },
];

export const mockUsers = [
  { id: 1, name: 'Arjun Desai', mobile: '9824000001', email: 'arjun@transco.in', role: 'admin', language_pref: 'en', is_active: true, last_login_at: '2026-06-22T07:10:00' },
  { id: 2, name: 'Kavya Nair', mobile: '9824000002', email: 'kavya@transco.in', role: 'trip_manager', language_pref: 'en', is_active: true, last_login_at: '2026-06-22T06:40:00' },
  { id: 3, name: 'Priya Shah', mobile: '9824000003', email: 'priya@transco.in', role: 'finance_manager', language_pref: 'gu', is_active: true, last_login_at: '2026-06-21T19:00:00' },
  { id: 4, name: 'Rahul Verma', mobile: '9824000004', email: 'rahul@transco.in', role: 'account_manager', language_pref: 'hi', is_active: true, last_login_at: '2026-06-22T05:55:00' },
  { id: 11, name: 'Ramesh Yadav', mobile: '9824111111', email: null, role: 'driver', language_pref: 'hi', is_active: true, last_login_at: '2026-06-22T04:20:00' },
];

export const mockRoles = [
  { id: 1, name: 'admin', label: 'Admin', is_system: true, users: 1, description: 'Full system access' },
  { id: 2, name: 'trip_manager', label: 'Trip Manager', is_system: true, users: 3, description: 'Manage trips, drivers, vehicles' },
  { id: 3, name: 'finance_manager', label: 'Finance Manager', is_system: true, users: 2, description: 'Approve expenses, invoices, reconcile' },
  { id: 4, name: 'account_manager', label: 'Account Manager', is_system: true, users: 2, description: 'Clients, LRs, invoices' },
  { id: 5, name: 'driver', label: 'Driver', is_system: true, users: 18, description: 'Mobile-first trip + expense' },
];

export const mockAuditLogs = [
  { id: 1, user_name: 'Priya Shah', user_role: 'finance_manager', action: 'expense.approved', resource_type: 'trip_expenses', resource_id: 3, resource_label: 'Fuel ₹18,400 — LR-2024-25-0005', created_at: '2026-06-22T07:42:00', before_state: { status: 'pending' }, after_state: { status: 'approved', approved_by: 3 } },
  { id: 2, user_name: 'System', user_role: 'system', action: 'fastag.synced', resource_type: 'fastag_wallets', resource_id: 3, resource_label: 'GJ-12-EF-9012', created_at: '2026-06-22T07:45:00', api: true, before_state: { balance: 409 }, after_state: { balance: 89 } },
  { id: 3, user_name: 'Rahul Verma', user_role: 'account_manager', action: 'invoice.created', resource_type: 'invoices', resource_id: 5, resource_label: 'INV-2024-25-0005', created_at: '2026-06-22T06:30:00', before_state: null, after_state: { status: 'draft', total_amount: 32025 } },
  { id: 4, user_name: 'Kavya Nair', user_role: 'trip_manager', action: 'trip.status.changed', resource_type: 'trips', resource_id: 4, resource_label: 'LR-2024-25-0004', created_at: '2026-06-21T06:30:00', before_state: { status: 'loading' }, after_state: { status: 'in_transit' } },
  { id: 5, user_name: 'System', user_role: 'system', action: 'fuel_card.synced', resource_type: 'fuel_cards', resource_id: 1, resource_label: 'HPCL ****1234', created_at: '2026-06-22T06:00:00', api: true, before_state: { balance: 29464 }, after_state: { balance: 18400 } },
  { id: 6, user_name: 'Arjun Desai', user_role: 'admin', action: 'user.created', resource_type: 'users', resource_id: 11, resource_label: 'Ramesh Yadav', created_at: '2026-06-20T11:15:00', before_state: null, after_state: { role: 'driver', is_active: true } },
];

export const mockTranslations = [
  { key: 'trips.status.in_transit', en: 'In Transit', hi: 'परिवहन में', gu: 'ટ્રાન્ઝિટ માં' },
  { key: 'trips.status.delivered', en: 'Delivered', hi: 'डिलीवर हुआ', gu: 'ડિલિવર થઈ' },
  { key: 'invoices.rcm_notice', en: 'Tax on Reverse Charge', hi: 'रिवर्स चार्ज पर कर', gu: 'રિવર્સ ચાર્જ પર ટેક્સ' },
  { key: 'fastag.low_balance', en: 'Low Balance Alert', hi: 'कम बैलेंस अलर्ट', gu: 'ઓછી બેલેન્સ ચેતવણી' },
  { key: 'fastag.toll_deducted', en: 'Toll Deducted', hi: 'टोल काटा गया', gu: 'ટોલ કપાયો' },
  { key: 'fuel.litres', en: 'Litres', hi: 'लीटर', gu: 'લિટર' },
  { key: 'fuel.diesel', en: 'Diesel (HSD)', hi: 'डीजल', gu: 'ડીઝલ' },
  { key: 'expenses.types.fuel', en: 'Fuel', hi: 'ईंधन', gu: 'ઇંધણ' },
  { key: 'common.approve', en: 'Approve', hi: 'स्वीकृत करें', gu: 'મંજૂર કરો' },
  { key: 'common.reject', en: 'Reject', hi: 'अस्वीकार करें', gu: 'નકારો' },
];

// KPI / dashboard summary
export const mockDashboard = {
  activeTrips: 2,
  deliveredThisMonth: 142,
  pendingExpenses: 4,
  revenueThisMonth: 2840000,
  outstanding: 2145000,
  fastagSpend: 184200,
  fuelSpend: 642000,
  fleetUtilisation: 78,
};

// Recharts series
export const mockRevenueSeries = [
  { month: 'Jan', revenue: 1820000, cost: 1240000 },
  { month: 'Feb', revenue: 2110000, cost: 1390000 },
  { month: 'Mar', revenue: 2480000, cost: 1610000 },
  { month: 'Apr', revenue: 2290000, cost: 1520000 },
  { month: 'May', revenue: 2720000, cost: 1780000 },
  { month: 'Jun', revenue: 2840000, cost: 1820000 },
];

export const mockTollByVehicle = [
  { vehicle: 'GJ-01', toll: 12400 },
  { vehicle: 'GJ-05', toll: 9800 },
  { vehicle: 'MH-12', toll: 15200 },
  { vehicle: 'GJ-18', toll: 6400 },
];

export const mockFuelByVehicle = [
  { vehicle: 'GJ-01', spend: 54200, litres: 590 },
  { vehicle: 'GJ-05', spend: 41800, litres: 456 },
  { vehicle: 'MH-12', spend: 68500, litres: 742 },
  { vehicle: 'GJ-18', spend: 28400, litres: 308 },
];

export const mockTripStatusDist = [
  { name: 'planned', value: 2 },
  { name: 'loading', value: 1 },
  { name: 'in_transit', value: 2 },
  { name: 'delivered', value: 2 },
  { name: 'cancelled', value: 1 },
];

export const mockActivityFeed = mockAuditLogs;
