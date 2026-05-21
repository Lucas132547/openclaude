/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"SF Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#ff7a1a',
          soft: 'rgba(255, 122, 26, 0.14)',
          line: 'rgba(255, 122, 26, 0.40)',
          2: '#ffb15f',
        },
        surface: {
          0: 'var(--bg)',
          1: 'var(--bg-elev)',
          2: 'var(--bg-soft)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
        },
        muted: 'var(--muted)',
        quiet: 'var(--quiet)',
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
