/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: {
            primary: "#1e1e1e",
            secondary: "#252525",
            card: "#282828",
            input: "#2a2a2a",
            hover: "#2d2d2d",
          },
          border: {
            DEFAULT: "#333333",
            hover: "#444444",
            active: "#b08050",
          },
          text: {
            primary: "#e0e0e0",
            secondary: "#999999",
            muted: "#666666",
            accent: "#b08050",
          },
          accent: {
            DEFAULT: "#b08050",
            hover: "#c09060",
            muted: "#8a6040",
          },
          status: {
            online: "#7a9060",
            warning: "#c09050",
            error: "#a05050",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}
