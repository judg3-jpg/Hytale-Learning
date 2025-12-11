/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          primary: '#0f1419',
          secondary: '#1a1f2e',
          tertiary: '#242b3d',
          border: '#2d3748',
        },
        // Light theme colors
        light: {
          primary: '#f8fafc',
          secondary: '#ffffff',
          tertiary: '#f1f5f9',
          border: '#e2e8f0',
        },
        // Accent colors
        accent: {
          primary: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
