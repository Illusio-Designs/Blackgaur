// Branding defaults + merge helper. Kept framework-agnostic (NO 'use client')
// so server components (root layout metadata) can import it directly.

// Default transporter branding — fallback so every page renders with no backend
// (section 13 / 14). A buyer overrides this from the admin panel.
export const DEFAULT_BRANDING = {
  companyName: 'TransCo Logistics',
  legalName: 'TransCo Logistics Pvt. Ltd.',
  tagline: 'Freight delivered on time, across India',
  logoUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  theme: {
    sidebar: '#0B1E3D',
    primary: '#1A56DB',
    accent: '#D97706',
  },
  contact: {
    email: 'ops@transco.in',
    phone: '+91 79 4000 1234',
    whatsapp: '+919900000000',
    addressLine: 'Plot 12, Transport Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gstin: '24ABCDE1234F1Z5',
  },
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  content: {
    hero: {
      title: 'Your goods, delivered on time — across India',
      subtitle:
        'Full-truck-load, part-load and container movement backed by a GPS + FASTag-enabled fleet and GST-compliant billing.',
      ctaPrimary: 'Get a quote',
      ctaSecondary: 'Track shipment',
    },
    stats: [
      { value: '50,000+', label: 'Trips delivered' },
      { value: '1,200+', label: 'Vehicles in network' },
      { value: '480+', label: 'Cities covered' },
      { value: '99.2%', label: 'On-time delivery' },
    ],
    services: [
      { key: 'ftl', title: 'Full Truck Load (FTL)', description: 'Dedicated trucks for bulk consignments, point to point.' },
      { key: 'ptl', title: 'Part Load (PTL)', description: 'Cost-efficient shared-load movement for smaller consignments.' },
      { key: 'container', title: 'Container & ODC', description: 'Containerised and over-dimensional cargo across highways and ports.' },
      { key: 'coldchain', title: 'Cold Chain', description: 'Temperature-controlled reefer trucks for perishables and pharma.' },
      { key: 'warehousing', title: 'Warehousing', description: 'Storage, cross-dock and distribution from strategic hubs.' },
      { key: 'lastmile', title: 'Last-mile', description: 'Reliable city distribution and final-mile delivery.' },
    ],
    why: [
      { title: 'Live GPS tracking', description: 'Track every shipment by LR number in real time.' },
      { title: 'FASTag-enabled fleet', description: 'Seamless toll movement and transparent trip costs.' },
      { title: 'GST & RCM compliant', description: 'Correct invoicing with e-way bill and reverse-charge handling.' },
      { title: 'Pan-India network', description: 'Branches and partners across major industrial corridors.' },
    ],
    about: {
      heading: 'Built for Indian road transport',
      body: 'We move freight for manufacturers, distributors and e-commerce businesses with a modern, technology-driven fleet operation.',
    },
  },
};

export const BRANDING_QUERY_KEY = ['branding'];

// Deep-merge incoming branding onto the defaults so partial payloads stay safe.
export function mergeBranding(data) {
  if (!data || typeof data !== 'object') return DEFAULT_BRANDING;
  return {
    ...DEFAULT_BRANDING,
    ...data,
    theme: { ...DEFAULT_BRANDING.theme, ...(data.theme || {}) },
    contact: { ...DEFAULT_BRANDING.contact, ...(data.contact || {}) },
    social: { ...DEFAULT_BRANDING.social, ...(data.social || {}) },
    content: {
      ...DEFAULT_BRANDING.content,
      ...(data.content || {}),
      hero: { ...DEFAULT_BRANDING.content.hero, ...(data.content?.hero || {}) },
      about: { ...DEFAULT_BRANDING.content.about, ...(data.content?.about || {}) },
      stats: data.content?.stats?.length ? data.content.stats : DEFAULT_BRANDING.content.stats,
      services: data.content?.services?.length
        ? data.content.services
        : DEFAULT_BRANDING.content.services,
      why: data.content?.why?.length ? data.content.why : DEFAULT_BRANDING.content.why,
    },
  };
}
