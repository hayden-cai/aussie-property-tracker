/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        surface: {
          900: '#060e0b',
          800: '#0a1a14',
          700: '#0f2419',
          600: '#152d1f',
        },
        brand: {
          DEFAULT: '#10b981',
          light:   '#34d399',
          dark:    '#059669',
          faint:   '#e1f5ee',
          pale:    '#f0fdf9',
        },
        muted: '#4b7060',
      },
      animation: {
        'slide-in':    'slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up':     'fadeUp 0.4s ease forwards',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'toast-in':    'toastIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        slideIn:     { '0%': { opacity:'0', transform:'translateY(-16px) scale(0.97)' }, '100%': { opacity:'1', transform:'translateY(0) scale(1)' } },
        fadeUp:      { '0%': { opacity:'0', transform:'translateY(10px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        pulseBrand:  { '0%,100%': { boxShadow:'0 0 0 0 rgba(16,185,129,0)' }, '50%': { boxShadow:'0 0 0 6px rgba(16,185,129,0.15)' } },
        toastIn:     { '0%': { opacity:'0', transform:'translateY(16px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
