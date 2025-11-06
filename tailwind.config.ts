import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TradingView-inspired color palette
        slate: {
          950: '#0e1627', // Deep charcoal background
          900: '#161b22', // Primary background
          800: '#21262d', // Secondary background
          700: '#30363d', // Borders and dividers
          600: '#484f58', // Hover states
          500: '#6e7681', // Secondary text
          400: '#8b949e', // Muted text
          300: '#c9d1d9', // Primary text
          200: '#e6edf3', // Bright text
          100: '#f0f6fc', // Accent backgrounds
        },
        // Professional accent colors
        blue: {
          600: '#1f6feb', // Primary blue (TradingView style)
          500: '#2b7eea',
          400: '#58a6ff',
          300: '#79c0ff',
        },
        green: {
          600: '#238636', // Success green (TradingView style)
          500: '#2ea043',
          400: '#3fb950',
        },
        red: {
          600: '#da3633', // Danger red (TradingView style)
          500: '#f85149',
          400: '#ff7b72',
        },
        yellow: {
          600: '#d29922', // Warning yellow
          500: '#e3b341',
          400: '#f2cc60',
        },
        orange: {
          600: '#fb8500', // Accent orange
          500: '#ff9500',
          400: '#ffa657',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(31, 111, 235, 0.3)',
        'glow-green': '0 0 20px rgba(35, 134, 54, 0.3)',
        'glow-red': '0 0 20px rgba(218, 54, 51, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
