/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts,scss}'],
  theme: {
    extend: {
      colors: {
        'base-dark': '#0C1618',
        'base-cream': '#faf4d3',
        'accent-gold': '#D1AC00',
        'accent-teal': {
          DEFAULT: '#004643',
          dark: '#002e2b',
        }
      },
      fontFamily: {
        serif: ['"Bodoni Moda"', 'serif'],
        sans: ['Urbanist', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

