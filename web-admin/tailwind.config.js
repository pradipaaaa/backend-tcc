/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#0E7C7B',
          dark: '#0B6766',
          light: '#73BFB8',
        },
        secondary: '#3DA5D9',
        // Status
        waiting: '#F59E0B',
        calling: '#0E7C7B',
        done: '#10B981',
        skipped: '#94A3B8',
        // Neutrals
        ink: '#0F172A',
        muted: '#475569',
        subtle: '#94A3B8',
        line: '#E2E8F0',
        chip: '#F8FAFC',
        bg: '#F1F5F9',
        // Tints
        callingTint: 'rgba(14,124,123,0.08)',
        warningTint: '#FEF3C7',
        warningInk: '#92400E',
        successTint: '#D1FAE5',
        successInk: '#065F46',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        label: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(15, 23, 42, 0.06)',
        elevated: '0 12px 40px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
