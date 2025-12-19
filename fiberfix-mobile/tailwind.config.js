/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        fiber: {
          orange: '#FF6D00', // Naranja Seguridad
          blue: '#002F6C',   // Azul Trabajo
          gray: '#F1F5F9',
          border: '#E2E8F0',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
        }
      },
    },
  },
  plugins: [],
}