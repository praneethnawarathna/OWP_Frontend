/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#5B1435',
          900: '#380B20',
          850: '#480E2A',
          800: '#5B1435',
          700: '#701A40',
          600: '#8E406F',
          500: '#A45385',
          100: '#FDF0F4',
          50:  '#FAF2F5',
        },
        mauve: {
          DEFAULT: '#8E406F',
          hover:   '#73325A',
          light:   '#FDF0F4',
          border:  '#F1E5EC',
          muted:   '#e8c4d8',
        },
        linen: {
          DEFAULT: '#FAF7F6',
          50:      '#FDFBFB',
          100:     '#FAF7F6',
          200:     '#F4EFEA',
          300:     '#EDE4DD',
          border:  '#EFE8E3',
        },
        gold: {
          DEFAULT: '#C5A880',
          light:   '#E8DCC8',
          dark:    '#9D7D54',
          accent:  '#D4AF37',
        }
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(91, 20, 53, 0.08), 0 0 1px 1px rgba(91, 20, 53, 0.04)',
        'luxury-hover': '0 30px 60px -20px rgba(91, 20, 53, 0.16), 0 0 1px 1px rgba(91, 20, 53, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
