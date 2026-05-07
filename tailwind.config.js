/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#03080F',
        teal: { DEFAULT: '#1BE4C8', dim: '#12A68F' },
        amber: { DEFAULT: '#D4A853', dim: '#A07A30' },
        surface: '#0D1520',
        border: '#1A2535',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
