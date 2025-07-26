/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // <-- to jest bardzo ważne!
    ],
    theme: {
      extend: {
        colors: {
          lilac: '#786599',
        },
      },
    },
    plugins: [],
  }