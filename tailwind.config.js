/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090B',
          900: '#0d1117',
          850: '#111827',
          800: '#1E293B',
        },
        accent: {
          violet: '#A78BFA',
          sky: '#7DD3FC',
          pink: '#F9A8D4',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        clock: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        glass: '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 40px -8px var(--accent, #A78BFA)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 18s ease infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 4s linear infinite',
      },
    },
  },
  plugins: [],
}
