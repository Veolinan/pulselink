import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        'paper-2': '#F3EEE3',
        ink: '#1A1612',
        'ink-2': '#4A4540',
        'ink-3': '#8E8A83',
        line: '#E7E1D6',
        'brand-red': '#B8241A',
        'brand-red-light': '#F5EAE9',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'display-1': ['64px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-2': ['48px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-3': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-2': ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['17px', { lineHeight: '1.65' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.55' }],
        'label': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'mono-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        '2xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04)',
        'elevated': '0 4px 12px rgba(26,22,18,0.08), 0 2px 4px rgba(26,22,18,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;