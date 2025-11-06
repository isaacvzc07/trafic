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
        // Security Design System - Primary Palette
        primary: {
          950: '#0a0e1b',
          900: '#0f1729',
          850: '#141f38',
          800: '#1a2847',
          700: '#253765',
          600: '#304583',
          500: '#3b54a1',
          400: '#4d6bc4',
          300: '#6b87db',
          200: '#94aae7',
          100: '#c2d0f0',
          50: '#e8edf8',
        },
        // Security Design System - Accent Colors
        cyan: '#00d4ff',
        emerald: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
        purple: '#8b5cf6',
        // Semantic Colors
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0891b2',
        critical: '#ff0844',
        // Neutral Colors (for fallback)
        neutral: {
          950: '#030712',
          900: '#0a0f1e',
          850: '#111827',
          800: '#1a202e',
          750: '#232937',
          700: '#2d3748',
          600: '#374151',
          500: '#4a5568',
          400: '#6b7280',
          300: '#9ca3af',
          200: '#d1d5db',
          100: '#e5e7eb',
          50: '#f3f4f6',
          25: '#f9fafb',
        },
      },
      fontFamily: {
        display: ['var(--font-inter-tight)', 'SF Pro Display', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'SF Mono', 'Consolas', 'monospace'],
        data: ['var(--font-roboto-mono)', 'IBM Plex Mono', 'monospace'],
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
        'mesh': 'meshAnimation 20s ease infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'grid-move': 'gridMove 10s linear infinite',
        'holographic': 'holographicShift 4s ease infinite',
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
        meshAnimation: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        holographicShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
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
