import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B6FE8',
        'primary-light': '#7B8FF5',
        'primary-xlight': '#9BB0FF',
        'bg-app': '#F5F5F5',
        'text-main': '#1A1A2E',
        'text-muted': '#9E9E9E',
        'status-pending': '#F59E0B',
        'status-paid': '#10B981',
        'status-overdue': '#EF4444',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        pill: '50px',
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 6px 20px rgba(91,111,232,0.15)',
        glass: '0 4px 15px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
        'gradient-text': 'linear-gradient(90deg, #fff, #c5ccff)',
      },
    },
  },
  plugins: [],
}
export default config
