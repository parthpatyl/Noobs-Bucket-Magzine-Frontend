/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'open-sans-<uniquifier>': ['"Open Sans"', 'serif']
      },
    },
  },
  plugins: [],
}