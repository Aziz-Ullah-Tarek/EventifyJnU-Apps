/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#9ED3DC',
          yellow: '#FEFD99',
          pink: '#FCB7C7',
          rose: '#CA6180',
        }
      },
      fontFamily: {
        montserrat: ['Montserrat_400Regular', 'sans-serif'],
        montserratBold: ['Montserrat_700Bold', 'sans-serif'],
        poppins: ['Poppins_400Regular', 'sans-serif'],
        poppinsBold: ['Poppins_700Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
