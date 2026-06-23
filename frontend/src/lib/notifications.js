// Notification model + the full set of TMS notification types.
// severity drives the colour; icon is a lucide-react icon name resolved in the UI.

export const NOTIF_SEVERITY = {
  info: { dot: 'bg-brand-blue', chip: 'bg-blue-50 text-brand-blue' },
  success: { dot: 'bg-brand-success', chip: 'bg-emerald-50 text-brand-success' },
  warning: { dot: 'bg-brand-amber', chip: 'bg-amber-50 text-brand-amber' },
  danger: { dot: 'bg-brand-danger', chip: 'bg-red-50 text-brand-danger' },
};

// Every kind of notification the platform raises (operational + financial + system).
export const NOTIF_TYPES = {
  fastag_low_balance: { icon: 'Wallet', severity: 'warning' },
  fastag_synced: { icon: 'Radio', severity: 'info', api: true },
  fuel_card_blocked: { icon: 'Ban', severity: 'danger' },
  fuel_low_balance: { icon: 'Fuel', severity: 'warning' },
  doc_expiry: { icon: 'FileWarning', severity: 'warning' },
  expense_pending: { icon: 'ReceiptText', severity: 'info' },
  expense_approved: { icon: 'CheckCircle2', severity: 'success' },
  invoice_overdue: { icon: 'FileText', severity: 'danger' },
  invoice_approval: { icon: 'FileText', severity: 'info' },
  payment_received: { icon: 'Banknote', severity: 'success' },
  trip_delivered: { icon: 'PackageCheck', severity: 'success' },
  pod_uploaded: { icon: 'Camera', severity: 'info' },
  user_added: { icon: 'UserPlus', severity: 'info' },
};

// Representative notifications feed (demo). In production these stream from the API.
export const mockNotifications = [
  { id: 1, type: 'fastag_low_balance', title: 'FASTag low balance', message: 'GJ-12-EF-9012 balance is ₹89 — recharge soon', time: '8m ago', read: false, href: '/dashboard/fastag' },
  { id: 2, type: 'expense_pending', title: 'Expenses awaiting approval', message: '4 driver expense claims need your review', time: '25m ago', read: false, href: '/dashboard/finance/expenses' },
  { id: 3, type: 'invoice_overdue', title: 'Invoice overdue', message: 'INV-2024-25-0004 — ₹75,000 from Maruti Suzuki Parts', time: '1h ago', read: false, href: '/dashboard/finance/invoices' },
  { id: 4, type: 'doc_expiry', title: 'Document expiring', message: 'Permit for GJ-01-AB-1234 expires in 5 days', time: '2h ago', read: false, href: '/dashboard/vehicles' },
  { id: 5, type: 'fastag_synced', title: 'FASTag synced', message: '12 new toll transactions imported', time: '3h ago', read: true, href: '/dashboard/fastag' },
  { id: 6, type: 'trip_delivered', title: 'Trip delivered', message: 'LR-2024-25-0006 delivered — POD uploaded', time: '5h ago', read: true, href: '/dashboard/trips' },
  { id: 7, type: 'fuel_card_blocked', title: 'Fuel card blocked', message: 'BPCL ****9901 blocked — monthly limit exceeded', time: '8h ago', read: true, href: '/dashboard/fuel' },
  { id: 8, type: 'payment_received', title: 'Payment received', message: 'INV-2024-25-0002 — ₹37,800 from Reliance Retail', time: '1d ago', read: true, href: '/dashboard/finance/invoices' },
];
