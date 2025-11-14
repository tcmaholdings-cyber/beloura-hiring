/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stage colors
        'stage-new': '#94A3B8',
        'stage-qualifying': '#60A5FA',
        'stage-interview': '#F59E0B',
        'stage-tests': '#10B981',
        'stage-mock': '#8B5CF6',
        'stage-onboarding': '#EC4899',
        'stage-probation': '#14B8A6',

        // Verdict colors
        'verdict-pass': '#10B981',
        'verdict-fail': '#EF4444',
        'verdict-no-show': '#F59E0B',

        // Bonus status colors
        'bonus-pending': '#F59E0B',
        'bonus-approved': '#10B981',
        'bonus-paid': '#3B82F6',
      },
    },
  },
  plugins: [],
}
