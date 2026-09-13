import { isNight } from '@/lib/theme/nightMode'

describe('isNight', () => {
  const at = (h: number, m = 0) => { const d = new Date(2026, 8, 13, h, m); return d }
  it('crosses midnight', () => {
    expect(isNight(at(22))).toBe(true)
    expect(isNight(at(2))).toBe(true)
    expect(isNight(at(6))).toBe(false)
    expect(isNight(at(12))).toBe(false)
    expect(isNight(at(20, 59))).toBe(false)
  })
  it('handles a same-day window', () => {
    expect(isNight(at(14), '13:00', '15:00')).toBe(true)
    expect(isNight(at(16), '13:00', '15:00')).toBe(false)
  })
})
