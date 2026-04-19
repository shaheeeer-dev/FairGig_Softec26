/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#87aaff',
          400: '#547eff',
          500: '#2d54fc',
          600: '#1a36f0',
          700: '#1328d4',
          800: '#1523ac',
          900: '#162289',
        },
        surface: {
          DEFAULT: '#0f1623',
          card:    '#16202f',
          muted:   '#1e2d40',
          border:  '#243348',
        },
      },
    },
  },
  plugins: [],
}
