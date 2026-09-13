import { proteinTargetG, weightEma } from '@/lib/nutrition/targets'

describe('targets', () => {
  it('protein target = weight × band, floored at 90', () => {
    expect(proteinTargetG(90, 1.4)).toBe(126)
    expect(proteinTargetG(50, 1.2)).toBe(90)
    expect(proteinTargetG(0)).toBe(100)
  })
  it('ema smooths noise', () => {
    const out = weightEma([
      { logged_at: '2026-09-01', weight_kg: 90 },
      { logged_at: '2026-09-02', weight_kg: 92 },
      { logged_at: '2026-09-03', weight_kg: 89 },
    ])
    expect(out[0].ema).toBe(90)
    expect(out[1].ema).toBe(90.5)
    expect(out[2].ema).toBeCloseTo(90.13, 1)
  })
})
