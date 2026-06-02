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
      // Custom breakpoint for large desktop monitors (QHD/4K). The base fluid
      // tokens plateau by ~1920px; the `3xl:` *-hd tokens take over above it.
      screens: {
        '3xl': '1920px',
      },
      fontSize: {
        // Fluid UI/body scale. rem-anchored floor + ceiling so browser zoom still
        // works (WCAG 1.4.4); the vw term shrinks as text gets more functional, so
        // reading text barely moves while the display hero (inline clamp) swings.
        // These plateau at their ceiling by ~1920px and govern <=1920px screens.
        'fluid-xs': 'clamp(0.68rem, 0.64rem + 0.2vw, 0.78rem)',
        'fluid-sm': 'clamp(0.8rem, 0.74rem + 0.3vw, 0.95rem)',
        'fluid-base': 'clamp(0.95rem, 0.9rem + 0.4vw, 1.1rem)',
        'fluid-lg': 'clamp(1.1rem, 0.95rem + 0.9vw, 1.45rem)',
        // Large-monitor ramp, applied via the `3xl:` variant (>=1920px). Each
        // resumes from its base ceiling at 1920px and grows to a bigger cap by
        // ~3840px, so QHD/4K read larger while <=1920px stays untouched.
        'fluid-xs-hd': 'clamp(0.78rem, 0.5rem + 0.23vw, 1.05rem)',
        'fluid-sm-hd': 'clamp(0.95rem, 0.6rem + 0.29vw, 1.3rem)',
        'fluid-base-hd': 'clamp(1.1rem, 0.6rem + 0.42vw, 1.6rem)',
        'fluid-lg-hd': 'clamp(1.45rem, 0.8rem + 0.54vw, 2.1rem)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

