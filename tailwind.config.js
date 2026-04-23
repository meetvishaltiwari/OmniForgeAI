export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0a66c2',
          hover: '#004182',
          light: '#70b5f9',
          bg: '#f3f2ef',
          text: '#000000e6',
          muted: '#00000099',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Fira Sans', 'Ubuntu', 'Oxygen', 'Oxygen Sans', 'Cantarell', 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
