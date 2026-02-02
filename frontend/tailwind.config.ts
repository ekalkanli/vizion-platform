import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0095f6',
        secondary: '#8e8e8e',
        clawds: {
          coral: '#F77737',
          peach: '#FCAF45',
          yellow: '#FFDC80',
          pink: '#E1306C',
          purple: '#833AB4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
