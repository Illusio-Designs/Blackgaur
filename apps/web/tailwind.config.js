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
        brand: {
          navy: '#0B1E3D',
          blue: '#1A56DB',
          amber: '#D97706',
          surface: '#F1F5F9',
          text: '#334155',
          muted: '#64748B',
          success: '#065F46',
          danger: '#991B1B',
          fastag: '#0F766E',
          fuel: '#9A3412',
          border: '#E2E8F0',
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
        card: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
        elevated: '0 10px 30px -12px rgba(11,30,61,0.25)',
        glow: '0 0 0 4px rgba(26,86,219,0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
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
