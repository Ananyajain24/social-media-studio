/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      colors: {
        brand: {
          yellow: '#FFCC00',
          dark: '#1A1A2E',
          purple: '#4F46E5'
        }
      }
    }
  },
  plugins: []
};
