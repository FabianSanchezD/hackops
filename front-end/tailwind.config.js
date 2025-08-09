/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.svg",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Montserrat", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#0a174e",
        secondary: "#19376d",
        accent: "#7c3aed",
      },
    },
  },
  plugins: [],
};
