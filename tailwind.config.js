/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
        },
        secondary: "#64748b",
      },
      borderRadius: {
        container: "0.75rem",
      },
      gap: {
        section: "2rem",
      },
    },
  },
  plugins: [],
};
