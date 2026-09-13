import { nextSite } from '@/lib/protocol/sites'

describe('nextSite', () => {
  it('starts with abdomen left when nothing is logged', () => {
    expect(nextSite([])).toBe('abdomen_left')
  })
  it('picks an unused site before reusing', () => {
    expect(nextSite([{ site: 'abdomen_left', taken_at: '2026-09-01' }])).toBe('abdomen_right')
  })
  it('picks the least recently used once all are used', () => {
    const h = [
      { site: 'abdomen_left' as const, taken_at: '2026-08-01' },
      { site: 'abdomen_right' as const, taken_at: '2026-08-08' },
      { site: 'thigh_left' as const, taken_at: '2026-08-15' },
      { site: 'thigh_right' as const, taken_at: '2026-07-01' },
      { site: 'arm_left' as const, taken_at: '2026-08-22' },
      { site: 'arm_right' as const, taken_at: '2026-08-29' },
    ]
    expect(nextSite(h)).toBe('thigh_right')
  })
  it('ignores doses with no site', () => {
    expect(nextSite([{ site: null, taken_at: '2026-09-01' }])).toBe('abdomen_left')
  })
})
