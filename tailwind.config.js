// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Ensure all files are scanned
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#131314',
          surface: '#202124',
          primary: '#FF7A00',
          secondary: '#FFD600',
          accent: '#E50000',
          text: '#FFFFFF',
          muted: '#9CA3AF', // Gray-400 for muted text
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 122, 0, 0.3)',
        'glow-hover': '0 0 25px rgba(255, 122, 0, 0.5)',
      },
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
