import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        wa: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          deep: '#075E54',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1220',
        },
      },
      fontFamily: {
        sans: [
          '"Hind Siliguri"',
          '"Anek Bangla"',
          '"Noto Sans Bengali"',
          '"Bangla MN"',
          '"Nirmala UI"',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"Anek Bangla"',
          '"Hind Siliguri"',
          '"Noto Sans Bengali"',
          '"Bangla MN"',
          '"Nirmala UI"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06), 0 8px 24px -12px rgba(15,23,42,.18)',
        lift: '0 12px 32px -12px rgba(79,70,229,.35)',
        fab: '0 10px 30px -8px rgba(37,211,102,.55)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease both',
        'fade-in': 'fade-in .4s ease both',
        'sheet-up': 'sheet-up .32s cubic-bezier(.22,1,.36,1) both',
        'pop': 'pop .25s cubic-bezier(.22,1,.36,1) both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'marquee': 'marquee 22s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
