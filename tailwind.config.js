/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        mm: {
          100: '#DC143C',
          200: '#F75270',
          300: '#F08787',
          400: '#FFC7A7',
          500: '#FEE2AD',
          600: '#F8FAB4',
        },
      },
    },
  },
  plugins: [],
};
