import { shotNightCorrelation, proteinCorrelation, baseline } from '@/lib/sleep/correlations'

const nights = [
  { night_of: '2026-09-01', duration_min: 400 }, { night_of: '2026-09-02', duration_min: 440 }, { night_of: '2026-09-03', duration_min: 430 },
  { night_of: '2026-09-08', duration_min: 390 }, { night_of: '2026-09-09', duration_min: 450 }, { night_of: '2026-09-10', duration_min: 445 },
  { night_of: '2026-09-15', duration_min: 380 }, { night_of: '2026-09-16', duration_min: 460 },
]

describe('correlations', () => {
  it('needs three of each', () => {
    expect(shotNightCorrelation(nights, ['2026-09-01T10:00:00Z'])).toBeNull()
  })
  it('reports less sleep on shot nights', () => {
    const c = shotNightCorrelation(nights, ['2026-09-01T10:00:00Z', '2026-09-08T10:00:00Z', '2026-09-15T10:00:00Z'])
    expect(c).not.toBeNull()
    expect(c!.delta_min).toBeLessThan(-15)
    expect(c!.text).toContain('less')
  })
  it('protein correlation compares hit vs missed days', () => {
    const p = nights.map((n, i) => ({ date: n.night_of, protein_g: i % 2 === 0 ? 130 : 80 }))
    const c = proteinCorrelation(nights, p, 120)
    expect(c).not.toBeNull()
    expect(c!.n_a + c!.n_b).toBe(8)
  })
  it('baseline needs three values', () => {
    expect(baseline([50, null, 60])).toBeNull()
    expect(baseline([50, 60, 70])).toBe(60)
  })
})
