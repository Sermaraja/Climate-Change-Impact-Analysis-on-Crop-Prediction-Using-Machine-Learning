/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crop: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        climate: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        earth: {
          50: '#faf7f2',
          100: '#f3ece0',
          200: '#e5d7c3',
          300: '#d2bca0',
          400: '#bd9c7b',
          500: '#a8815d',
          600: '#946f50',
          700: '#78553f',
          800: '#634737',
          900: '#523c30',
        },
        warning: {
          low: '#22c55e',
          moderate: '#eab308',
          high: '#f97316',
          extreme: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 40, 24, 0.15)',
        'card-glow': '0 0 20px -5px rgba(34, 197, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
