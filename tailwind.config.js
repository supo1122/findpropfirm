/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './rules.html', './compare.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Noto Sans TC'", 'sans-serif'],
        body: ["'Barlow'", "'Noto Sans TC'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
