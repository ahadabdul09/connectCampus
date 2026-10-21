/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          primary: {
            DEFAULT: '#245C4A', // Forest Green
            hover: '#1B4739',
            light: '#EAF1EE',
            border: '#2E735D',
          },
          accent: {
            DEFAULT: '#C66A4A', // Terracotta
            hover: '#AD593B',
            light: '#F8EFEA',
          },
          bg: '#F7F5F0',       // Warm Off-White
          surface: '#FFFFFF',  // Clean White
          secondary: '#EEECE6',// Warm Grey
          border: '#D8D5CD',   // Divider sand
          text: {
            primary: '#242622',   // Deep Charcoal
            secondary: '#6C6E68', // Slate Olive
            muted: '#8C8E87',
          },
          state: {
            success: '#3F7658', // Sage Pine
            warning: '#B27A36', // Warm Amber
            error: '#B84F4F',   // Muted Crimson
          }
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'input': '8px',
        'btn': '8px',
        'card': '10px',
        'container': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(36, 38, 34, 0.05)',
        'elevated': '0 4px 12px rgba(36, 38, 34, 0.08)',
        'modal': '0 12px 32px rgba(36, 38, 34, 0.12)',
      }
    },
  },
  plugins: [],
}
