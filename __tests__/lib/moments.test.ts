import { activeEvents, pickMoment, type Snapshot } from '@/lib/moments/engine'

const now = new Date('2026-09-13T10:00:00Z')
const base: Snapshot = {
  now, onboarded: true,
  medications: [{ licensed: true, form: 'pen', start_date: '2026-07-01', interval_days: 7 }],
  doses: [], titrationSteps: [], sideEffects: [], proteinByDay: [], proteinTargetG: 120,
  training: [], weights: [], sleep: [], isShotDay: false, nightModeActive: false, reads: [],
}

describe('moments engine', () => {
  it('serves the intro first after onboarding', () => {
    expect(pickMoment(base)?.id).toBe('how-glp1-works')
  })
  it('respects cooldown: intro read yesterday is not served again', () => {
    const s = { ...base, reads: [{ moment_id: 'how-glp1-works', read_at: '2026-09-12T10:00:00Z' }] }
    expect(pickMoment(s)?.id).not.toBe('how-glp1-works')
  })
  it('missed dose outranks everything', () => {
    const s = { ...base, doses: [{ taken_at: '2026-09-01T10:00:00Z', dose_mg: 5 }] }
    expect(activeEvents(s).has('missed_dose')).toBe(true)
    expect(pickMoment(s)?.id).toBe('missed-dose')
  })
  it('nausea logged in the last day triggers the playbook', () => {
    const s = { ...base, reads: [{ moment_id: 'how-glp1-works', read_at: '2026-09-01T00:00:00Z' }], sideEffects: [{ logged_at: '2026-09-13T08:00:00Z', kind: 'nausea' }] }
    expect(pickMoment(s)?.id).toBe('nausea-playbook')
  })
  it('three days under protein triggers the protein moment', () => {
    const s = { ...base, reads: [{ moment_id: 'how-glp1-works', read_at: '2026-09-01T00:00:00Z' }],
      proteinByDay: [{ date: '2026-09-11', protein_g: 60 }, { date: '2026-09-12', protein_g: 70 }, { date: '2026-09-13', protein_g: 50 }] }
    expect(activeEvents(s).has('protein_under_target_3_days')).toBe(true)
  })
  it('three short nights triggers the sleep moment', () => {
    const s = { ...base, sleep: [{ night_of: '2026-09-10', duration_min: 300 }, { night_of: '2026-09-11', duration_min: 340 }, { night_of: '2026-09-12', duration_min: 320 }] }
    expect(activeEvents(s).has('sleep_under_6h_3_nights')).toBe(true)
  })
  it('unlicensed compound triggers harm reduction at top priority', () => {
    const s = { ...base, medications: [{ licensed: false, form: 'vial' as const, start_date: '2026-09-10', interval_days: 7 }] }
    expect(pickMoment(s)?.id).toBe('unlicensed-harm-reduction')
  })
  it('returns null when nothing applies', () => {
    const s = { ...base, onboarded: false, medications: [] }
    expect(pickMoment(s)).toBeNull()
  })
})
