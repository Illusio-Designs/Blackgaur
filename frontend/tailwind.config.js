/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables (section 13) so opacity utilities like
        // bg-brand-navy/10 keep working and buyers can re-theme at runtime.
        brand: {
          navy: 'rgb(var(--brand-navy) / <alpha-value>)',
          blue: 'rgb(var(--brand-blue) / <alpha-value>)',
          amber: 'rgb(var(--brand-amber) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          text: 'rgb(var(--brand-text) / <alpha-value>)',
          muted: 'rgb(var(--brand-muted) / <alpha-value>)',
          success: 'rgb(var(--brand-success) / <alpha-value>)',
          danger: 'rgb(var(--brand-danger) / <alpha-value>)',
          fastag: 'rgb(var(--brand-fastag) / <alpha-value>)',
          fuel: 'rgb(var(--brand-fuel) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        heading: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        hindi: ['var(--font-hindi)', 'Hind Vadodara', 'sans-serif'],
        gujarati: ['var(--font-gujarati)', 'Noto Sans Gujarati', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        // Premium, soft, layered shadows (SaaS-grade depth).
        soft: '0 1px 2px rgba(16,24,40,0.04)',
        card: '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px -6px rgba(16,24,40,0.10)',
        elevated:
          '0 1px 3px rgba(16,24,40,0.06), 0 14px 44px -12px rgba(11,30,61,0.30), 0 6px 16px -10px rgba(11,30,61,0.16)',
        glow: '0 0 0 4px rgba(26,86,219,0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(6,95,70,0.5)' },
          '70%': { boxShadow: '0 0 0 8px rgba(6,95,70,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(6,95,70,0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out',
        'pulse-ring': 'pulse-ring 1.8s infinite',
        shimmer: 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
