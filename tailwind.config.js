/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["Poppins", "sans-serif"],
        secondary: ["Roboto", "sans-serif"],
      },

      colors: {
        /* Brand */
        primary: "#FF7043",
        primaryHover: "#F4511E",

        /* Backgrounds */
        bgApp: "#FFFDF9",
        bgSurface: "#FFFFFF",
        bgSurfaceAlt: "#FAF3EB",

        /* Text */
        textStrong: "#263238",
        textDefault: "#546E7A",
        textMuted: "#9CA3AF",

        /* Borders */
        borderDefault: "#ECEFF1",

        /* Semantic */
        successText: "#15803d",
        dangerText: "#be123c",
        warningText: "#c2410c",
        infoText: "#0369a1",
      },

      borderRadius: {
        xl2: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};