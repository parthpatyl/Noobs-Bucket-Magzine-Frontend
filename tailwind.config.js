// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Ensure all files are scanned
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeOut: 'fadeOut 0.5s ease-in-out',
        scaleIn: 'scaleIn 0.5s ease-in-out',
        scaleOut: 'scaleOut 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' },
        },
        scaleOut: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(0.95)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
