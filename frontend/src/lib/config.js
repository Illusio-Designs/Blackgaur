// App configuration defaults + merge helper. Framework-agnostic (NO 'use client').
// ADMIN-ONLY config (company/GST, tax/RCM, integration preferences, alerts).
// Mirrors the backend DEFAULT_CONFIG (src/controllers/config.controller.js).
// Never contains secrets / API keys — those live in server .env.

export const DEFAULT_CONFIG = {
  company: {
    legalName: 'TransCo Logistics Pvt Ltd',
    gstin: '24ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    stateCode: '24',
    cin: '',
    registeredAddress: 'Plot 12, Transport Nagar, Ahmedabad, Gujarat 380016',
    bankName: 'HDFC Bank',
    bankAccount: '50200012345678',
    ifsc: 'HDFC0001234',
    financialYear: '2024-25',
    invoicePrefix: 'INV',
  },
  tax: {
    rcmDefault: true,
    gstRate: 5,
    itcEnabled: false,
    tdsRate: 2,
    tdsSection: '194C',
    placeOfSupplyAuto: true,
  },
  integrations: {
    otpProvider: 'MSG91',
    msg91SenderId: 'TMSAPP',
    fastagProvider: 'IHMCL',
    fastagLowBalanceDefault: 200,
    fuelProviders: ['HPCL', 'IOCL'],
    fastagSyncCron: '*/15 * * * *',
    fuelSyncCron: '*/30 * * * *',
  },
  alerts: {
    lowBalanceThreshold: 200,
    docExpiryLeadDays: 30,
    notifyEmail: true,
    notifySms: false,
  },
};

export const CONFIG_QUERY_KEY = ['app-config'];

// Deep-merge incoming config onto the defaults so partial payloads stay safe.
export function mergeConfig(data) {
  if (!data || typeof data !== 'object') return DEFAULT_CONFIG;
  return {
    company: { ...DEFAULT_CONFIG.company, ...(data.company || {}) },
    tax: { ...DEFAULT_CONFIG.tax, ...(data.tax || {}) },
    integrations: {
      ...DEFAULT_CONFIG.integrations,
      ...(data.integrations || {}),
      fuelProviders: Array.isArray(data.integrations?.fuelProviders)
        ? data.integrations.fuelProviders
        : DEFAULT_CONFIG.integrations.fuelProviders,
    },
    alerts: { ...DEFAULT_CONFIG.alerts, ...(data.alerts || {}) },
  };
}
