import type { Config } from 'tailwindcss'

// Colours are CSS variables so the same classes render day, dark and night
// palettes. Tokens live in app/globals.css; see docs/03-design-and-education.md.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        protein: 'var(--protein)',
        water: 'var(--water)',
        steps: 'var(--steps)',
        sleep: 'var(--sleep)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
      },
      borderRadius: { card: '20px', chip: '12px' },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}

export default config
