/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EAE0',
        },
        forest: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          pale: '#D8F3DC',
        },
        gold: {
          DEFAULT: '#C9972C',
          pale: '#FDF3DC',
          highlight: '#F0D58A',
        },
        terra: {
          DEFAULT: '#C4724A',
          pale: '#FBEEE7',
          highlight: '#E8B49A',
        },
        ink: {
          DEFAULT: '#2C2416',
          mid: '#6B5B45',
          border: '#DDD3C2',
          muted: '#A89880',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
