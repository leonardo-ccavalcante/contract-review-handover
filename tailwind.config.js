/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Bolt Food brand colors
        bolt: {
          green: '#34D399',
          'green-dark': '#10B981',
          'green-light': '#ECFDF5',
          'green-50': '#F0FDF4',
          black: '#0A0A0A',
          dark: '#1F2937',
          light: '#F9FAFB',
          pass: '#34D399',
          fail: '#EF4444',
          review: '#F59E0B',
          override: '#8B5CF6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
          dark: '#111827',
          'dark-secondary': '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        bolt: '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
