import { toCsv } from '@/lib/export/csv'
import { summariseWeek } from '@/lib/insights/build'

describe('csv', () => {
  it('escapes commas and quotes, unions columns', () => {
    const csv = toCsv([{ a: 1, b: 'x,y' }, { a: 2, c: 'say "hi"' }])
    expect(csv).toBe('a,b,c\n1,"x,y",\n2,,"say ""hi"""')
  })
  it('empty input is empty', () => { expect(toCsv([])).toBe('') })
})

describe('summariseWeek', () => {
  it('produces the expected lines', () => {
    const s = summariseWeek({
      weekStart: '2026-09-07', name: 'Paul',
      medication: { name: 'Mounjaro', dose_mg: 5, week: 5 },
      shots: [{ taken_at: '2026-09-10T09:00:00Z', site: 'abdomen_left' }], missedDose: false,
      weights: [{ logged_at: '2026-09-07', weight_kg: 90 }, { logged_at: '2026-09-13', weight_kg: 89.2 }],
      proteinByDay: [{ date: '2026-09-08', protein_g: 130 }, { date: '2026-09-09', protein_g: 90 }], proteinTargetG: 120,
      waterByDay: [{ date: '2026-09-08', ml: 2100 }], waterTargetMl: 2000,
      sideEffects: [{ logged_at: '2026-09-11', kind: 'nausea', severity: 1 }], training: [{ logged_at: '2026-09-09', kind: 'resistance' }],
      sleep: [{ night_of: '2026-09-08', duration_min: 420, hrv_ms: 50 }],
    })
    expect(s).toContain('Mounjaro 5 mg, week 5')
    expect(s).toContain('90 kg to 89.2 kg (-0.8 kg)')
    expect(s).toContain('hit on 1')
    expect(s).toContain('nausea ×1')
    expect(s).toContain('7h 0m')
  })
})
