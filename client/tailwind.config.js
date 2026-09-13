/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        figma: {
          canvas: "#FAF8F5",
          card: "#FFFFFF",
          border: "#EAE3D2",
          espresso: "#2D1C13",
          terracotta: "#E07A5F",
          terracottaHover: "#C85A32",
          muted: "#70665F",
          sand: "#F4F1EA",
          badgeGreenBg: "#E6F4EA",
          badgeGreenText: "#137333",
          badgeAmberBg: "#FEF7E0",
          badgeAmberText: "#B06000"
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
