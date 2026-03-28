/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2f7d3b",
          dark: "#246330",
          light: "#e8f5e9"
        },
        cream: "#faf8f5",
        warm: "#f5f0eb",
        border: "#e8e2db"
      },
      textColor: {
        primary: "#2d2a26",
        secondary: "#6b6560",
        muted: "#a39e99"
      },
      borderColor: {
        warm: "#e8e2db"
      }
    }
  },
  plugins: []
}
