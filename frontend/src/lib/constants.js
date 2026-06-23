// Enums, status lists & shared metadata — derived from section 4 schema.

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'trip_manager', label: 'Trip Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'driver', label: 'Driver' },
];

export const TRIP_STATUSES = ['planned', 'loading', 'in_transit', 'delivered', 'cancelled'];

export const KANBAN_COLUMNS = [
  { key: 'planned', accent: '#64748B' },
  { key: 'loading', accent: '#D97706' },
  { key: 'in_transit', accent: '#1A56DB' },
  { key: 'delivered', accent: '#065F46' },
  { key: 'cancelled', accent: '#991B1B' },
];

export const EXPENSE_TYPES = [
  'fuel', 'toll', 'loading', 'unloading', 'repair', 'bata', 'halting', 'misc',
];

export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected', 'auto_approved'];

export const INVOICE_STATUSES = [
  'draft', 'pending_approval', 'approved', 'sent', 'paid', 'cancelled',
];

export const INVOICE_TYPES = ['outward', 'credit_note', 'debit_note'];

export const FUEL_PRODUCTS = ['HSD', 'MS', 'LDO'];

export const FUEL_CARD_TYPES = [
  { value: 'hpcl_fleetcard', label: 'HPCL FleetCard' },
  { value: 'iocl_xtrarewards', label: 'IOCL XtraRewards' },
  { value: 'bpcl_smartfleet', label: 'BPCL SmartFleet' },
  { value: 'shell', label: 'Shell Fleet Plus' },
  { value: 'custom', label: 'Custom' },
];

export const FASTAG_ISSUERS = ['HDFC', 'SBI', 'ICICI', 'Paytm', 'IHMCL', 'Airtel'];

export const VEHICLE_TYPES = ['Truck', 'Trailer', 'Mini-truck', 'Tempo'];

export const OWNER_TYPES = ['own', 'attached', 'market'];

// Status badge color mapping (Tailwind text/bg classes) — section 13.1 tokens.
export const STATUS_COLORS = {
  // trips
  planned: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  loading: { bg: 'bg-amber-50', text: 'text-brand-amber', dot: 'bg-brand-amber' },
  in_transit: { bg: 'bg-blue-50', text: 'text-brand-blue', dot: 'bg-brand-blue' },
  delivered: { bg: 'bg-emerald-50', text: 'text-brand-success', dot: 'bg-brand-success' },
  cancelled: { bg: 'bg-red-50', text: 'text-brand-danger', dot: 'bg-brand-danger' },
  // expenses
  pending: { bg: 'bg-amber-50', text: 'text-brand-amber', dot: 'bg-brand-amber' },
  approved: { bg: 'bg-emerald-50', text: 'text-brand-success', dot: 'bg-brand-success' },
  auto_approved: { bg: 'bg-teal-50', text: 'text-brand-fastag', dot: 'bg-brand-fastag' },
  rejected: { bg: 'bg-red-50', text: 'text-brand-danger', dot: 'bg-brand-danger' },
  // invoices
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  pending_approval: { bg: 'bg-amber-50', text: 'text-brand-amber', dot: 'bg-brand-amber' },
  sent: { bg: 'bg-blue-50', text: 'text-brand-blue', dot: 'bg-brand-blue' },
  paid: { bg: 'bg-emerald-50', text: 'text-brand-success', dot: 'bg-brand-success' },
  // generic
  active: { bg: 'bg-emerald-50', text: 'text-brand-success', dot: 'bg-brand-success' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  blocked: { bg: 'bg-red-50', text: 'text-brand-danger', dot: 'bg-brand-danger' },
  overdue: { bg: 'bg-red-50', text: 'text-brand-danger', dot: 'bg-brand-danger' },
  low: { bg: 'bg-red-50', text: 'text-brand-danger', dot: 'bg-brand-danger' },
};

export function statusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.draft;
}

// Navigation per role (section 2.2 / 3.4 / 12.2)
export const NAV_ITEMS = [
  { key: 'admin', href: '/dashboard/admin', icon: 'LayoutDashboard', roles: ['admin'] },
  { key: 'users', href: '/dashboard/admin/users', icon: 'Users', roles: ['admin'] },
  { key: 'roles', href: '/dashboard/admin/roles', icon: 'ShieldCheck', roles: ['admin'] },
  { key: 'trips', href: '/dashboard/trips', icon: 'Truck', roles: ['admin', 'trip_manager', 'finance_manager', 'account_manager'] },
  { key: 'expenses', href: '/dashboard/finance/expenses', icon: 'ReceiptText', roles: ['admin', 'finance_manager'] },
  { key: 'invoices', href: '/dashboard/finance/invoices', icon: 'FileText', roles: ['admin', 'finance_manager', 'account_manager'] },
  { key: 'clients', href: '/dashboard/accounts/clients', icon: 'Building2', roles: ['admin', 'account_manager', 'finance_manager'] },
  { key: 'lr', href: '/dashboard/accounts/lr', icon: 'ScrollText', roles: ['admin', 'account_manager', 'trip_manager'] },
  { key: 'fastag', href: '/dashboard/fastag', icon: 'Radio', roles: ['admin', 'finance_manager', 'trip_manager'] },
  { key: 'fuel', href: '/dashboard/fuel', icon: 'Fuel', roles: ['admin', 'finance_manager'] },
  { key: 'reports', href: '/dashboard/reports', icon: 'BarChart3', roles: ['admin', 'trip_manager', 'finance_manager', 'account_manager'] },
  { key: 'driver', href: '/dashboard/driver', icon: 'SteeringWheel', roles: ['driver'] },
  { key: 'audit', href: '/dashboard/admin/audit-logs', icon: 'History', roles: ['admin'] },
  { key: 'translations', href: '/dashboard/admin/translations', icon: 'Languages', roles: ['admin'] },
  { key: 'settings', href: '/dashboard/admin/settings', icon: 'Palette', roles: ['admin'] },
];

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Ahmedabad', 'Surat', 'Pune', 'Bengaluru', 'Chennai',
  'Hyderabad', 'Kolkata', 'Jaipur', 'Nagpur', 'Indore', 'Vadodara', 'Rajkot',
];
