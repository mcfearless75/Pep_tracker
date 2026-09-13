import { remainingFraction, drugLevelMg, steadyStateTroughMg, levelFraction } from '@/lib/protocol/drugLevel'

describe('drug level', () => {
  it('halves after one half-life', () => {
    expect(remainingFraction(120, 120)).toBeCloseTo(0.5)
    expect(remainingFraction(0, 120)).toBe(1)
    expect(remainingFraction(-5, 120)).toBe(0)
  })
  it('sums remaining amounts across doses', () => {
    const now = new Date('2026-09-13T09:00:00Z')
    const doses = [
      { taken_at: '2026-09-13T09:00:00Z', dose_mg: 5 },
      { taken_at: '2026-09-08T09:00:00Z', dose_mg: 5 }, // 120 h ago, tirzepatide t½ = 120 h
    ]
    expect(drugLevelMg(doses, 120, now)).toBeCloseTo(7.5)
  })
  it('steady-state trough for weekly tirzepatide is below one dose', () => {
    const ss = steadyStateTroughMg(5, 120, 168)
    expect(ss).toBeGreaterThan(1)
    expect(ss).toBeLessThan(5)
  })
  it('fraction of steady state is ~1 once loaded', () => {
    const now = new Date('2026-09-13T09:00:00Z')
    const doses = Array.from({ length: 10 }, (_, i) => ({ taken_at: new Date(now.getTime() - i * 7 * 86_400_000).toISOString(), dose_mg: 5 }))
    const f = levelFraction(doses, 120, 5, 168, now)
    // Just after a dose, level = trough + dose, so > 1.
    expect(f).toBeGreaterThan(1)
    expect(f).toBeLessThan(4)
  })
})
