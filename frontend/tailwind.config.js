/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFF6EF',
        ink: {
          0: '#FFFFFF', 50: '#FBF4EE', 100: '#F2E5DA', 200: '#E2CFC0',
          300: '#C2A793', 400: '#9A7B65', 500: '#7A5C49', 600: '#604536',
          700: '#473226', 800: '#33231B', 900: '#241712',
        },
        peach: {
          50: '#FFF6F0', 100: '#FFE8DC', 200: '#FFD2BA', 300: '#FFB88F',
          400: '#FF9D68', 500: '#F2814A', 600: '#D9683A', 700: '#B8502B',
          800: '#8F3D20', 900: '#662C17',
        },
        amber: {
          50: '#FFFBEF', 100: '#FCEFD9', 200: '#F7DBA8', 300: '#F2C679',
          400: '#EFA93E', 500: '#D88E1A', 600: '#B8730A', 700: '#8A560A',
        },
        blush: {
          50: '#FDF0EE', 100: '#FBE0DC', 200: '#F6C2BA', 300: '#EE9C8F',
          500: '#DD6450', 600: '#C24A3D', 700: '#9A3327',
        },
        sage: {
          50: '#F1F6EE', 100: '#E2EEDC', 200: '#C5DEBB', 300: '#A4CB97',
          400: '#82B575', 500: '#5C9650', 600: '#477A3C',
        },
        terracotta: {
          400: '#DD7148', 500: '#C2562E', 600: '#A8431F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(89,46,21,0.10), 0 4px 16px rgba(89,46,21,0.12)',
        lift: '0 8px 32px rgba(89,46,21,0.20)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundOpacity: {
        8: '0.08',
      },
    },
  },
  plugins: [],
};
