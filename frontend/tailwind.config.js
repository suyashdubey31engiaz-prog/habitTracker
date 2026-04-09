/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2d6a4f',
          light:   '#52b788',
          pale:    '#d8f3dc',
        },
        accent: '#d4a853',
      },
    },
  },
  plugins: [],
}
