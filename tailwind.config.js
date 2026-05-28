/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F7',
          100: '#FFE4EA',
          200: '#FFBCCC',
          300: '#FF8FAD',
          400: '#FF6B95',
          500: '#E84B7A',
          600: '#C73568',
          700: '#A02455',
          800: '#7A1842',
          900: '#540F2E',
        },
        lavender: {
          50: '#F7F5FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        peach: {
          50: '#FFF8F4',
          100: '#FFEEDE',
          200: '#FFD5B5',
          300: '#FFB87A',
          400: '#FF9A4D',
          500: '#F97316',
        },
        cream: {
          50: '#FDF9F7',
          100: '#F7F0EC',
          200: '#EDE1D9',
          300: '#DDD0C8',
        },
      },
      fontFamily: {
        display: ['Fraunces-Regular'],
        'display-light': ['Fraunces-Light'],
        'display-semibold': ['Fraunces-SemiBold'],
        body: ['DM-Sans-Regular'],
        'body-medium': ['DM-Sans-Medium'],
        'body-bold': ['DM-Sans-Bold'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
