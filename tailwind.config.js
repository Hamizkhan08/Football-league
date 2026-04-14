/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nike-black': '#111111',
        'nike-white': '#FFFFFF',
        'nike-secondary': '#707072',
        'snow': '#FAFAFA',
        'light-gray': '#F5F5F5',
        'hover-gray': '#E5E5E5',
        'border-primary': '#707072',
        'border-secondary': '#CACACB',
        'nike-red': '#D30005',
        'nike-green': '#007D48',
        'nike-blue': '#1151FF',
        'nike-orange': '#FF5000',
        turf: {
          50:  '#f0fdf4',
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
        pitch: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        dark: {
          900: '#0a0f0a',
          800: '#0f1a0f',
          700: '#162316',
          600: '#1e321e',
          500: '#253d25',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        nike: ['"Barlow Condensed"', 'sans-serif'],
      },
      // Nike 8px spacing system — extends rather than overrides default Tailwind spacing
      borderRadius: {
        'nike': '30px',
        'nike-pill': '9999px',
      },
      backgroundImage: {
        'nike-hero': 'linear-gradient(to right, rgba(17,17,17,0.8), rgba(17,17,17,0.4), transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      boxShadow: {
        'nike-focus': '0 0 0 2px rgba(39, 93, 197, 1)',
      }
    },

  },
  plugins: [],
}
