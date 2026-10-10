/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0c192c',
          navy: '#162740',
          blue: '#1e3a5f',
          accent: '#0284c7',
        },
      },
    },
  },
  plugins: [],
}
