/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "../index.html", // Cập nhật đường dẫn nếu index.html ở root
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'], // hoặc Inter, Roboto,...
        heading: ['"Montserrat"', 'sans-serif'],
      },
    }
  },
  plugins: [],
}