import { suggestedBedtime, consistencyScore, readiness } from '@/lib/sleep/plan'

describe('sleep plan', () => {
  it('suggests a bedtime 7.5 h plus latency before the wake goal', () => {
    expect(suggestedBedtime('07:00')).toBe('23:10')
    expect(suggestedBedtime('06:00', 480)).toBe('21:40')
  })
  it('scores consistency', () => {
    expect(consistencyScore(['2026-09-10T23:00:00', '2026-09-11T23:05:00'])).toBeNull()
    expect(consistencyScore(['2026-09-10T23:00:00', '2026-09-11T23:05:00', '2026-09-12T22:58:00'])).toBe(100)
    const spread = consistencyScore(['2026-09-10T22:00:00', '2026-09-11T00:30:00', '2026-09-12T23:00:00'])
    expect(spread).toBeLessThan(80)
  })
  it('readiness levels', () => {
    expect(readiness(450, 55, 54)?.level).toBe('green')
    expect(readiness(380, 45, 54)?.level).toBe('amber')
    expect(readiness(300, 40, 54)?.level).toBe('red')
    expect(readiness(null, null, null)).toBeNull()
    expect(readiness(450, null, null)?.level).toBe('amber')
  })
})
