// client/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.jsx", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        "deep-blue": "#0d3b66",
        "deep-blue-dark": "#0a2a45",
        teal: {
          100: "#e0f2f1",
          200: "#b2dfdb",
          500: "#009688",
          800: "#00695c",
        },
      },
    },
  },
  plugins: [],
};
