// Turns a week of structured data into a compact text block for the model.
// No free text from the user goes in, so the prompt is cheap and predictable.

export type WeekData = {
  weekStart: string
  name: string | null
  medication: { name: string; dose_mg: number; week: number } | null
  shots: { taken_at: string; site: string | null }[]
  missedDose: boolean
  weights: { logged_at: string; weight_kg: number }[]
  proteinByDay: { date: string; protein_g: number }[]
  proteinTargetG: number
  waterByDay: { date: string; ml: number }[]
  waterTargetMl: number
  sideEffects: { logged_at: string; kind: string; severity: number }[]
  training: { logged_at: string; kind: string }[]
  sleep: { night_of: string; duration_min: number | null; hrv_ms: number | null }[]
}

export function summariseWeek(d: WeekData): string {
  const lines: string[] = []
  lines.push(`Week starting ${d.weekStart}.`)
  if (d.medication) lines.push(`Medication: ${d.medication.name} ${d.medication.dose_mg} mg, week ${d.medication.week} on protocol.`)
  lines.push(`Shots logged: ${d.shots.length}${d.missedDose ? ' (a dose is overdue)' : ''}.`)
  if (d.weights.length >= 2) {
    const first = d.weights[0].weight_kg, last = d.weights[d.weights.length - 1].weight_kg
    lines.push(`Weight: ${first} kg to ${last} kg (${(last - first).toFixed(1)} kg), ${d.weights.length} readings.`)
  } else if (d.weights.length === 1) lines.push(`Weight: one reading, ${d.weights[0].weight_kg} kg.`)
  else lines.push('Weight: not logged.')
  const pDays = d.proteinByDay.filter(p => p.protein_g > 0)
  const pHit = pDays.filter(p => p.protein_g >= d.proteinTargetG).length
  lines.push(`Protein: target ${d.proteinTargetG} g; logged on ${pDays.length} days; hit on ${pHit}; average ${pDays.length ? Math.round(pDays.reduce((s, p) => s + p.protein_g, 0) / pDays.length) : 0} g.`)
  const wDays = d.waterByDay.filter(w => w.ml > 0)
  lines.push(`Water: target ${d.waterTargetMl} ml; on target ${wDays.filter(w => w.ml >= d.waterTargetMl).length} of ${wDays.length} logged days.`)
  if (d.sideEffects.length) {
    const counts = d.sideEffects.reduce<Record<string, number>>((a, s) => { a[s.kind] = (a[s.kind] ?? 0) + 1; return a }, {})
    lines.push(`Side effects: ${Object.entries(counts).map(([k, n]) => `${k.replace('_', ' ')} ×${n}`).join(', ')}.`)
  } else lines.push('Side effects: none logged.')
  lines.push(`Training: ${d.training.filter(t => t.kind === 'resistance').length} resistance sessions, ${d.training.filter(t => t.kind !== 'resistance').length} other.`)
  const nights = d.sleep.filter(n => n.duration_min != null)
  if (nights.length) {
    const avg = Math.round(nights.reduce((s, n) => s + n.duration_min!, 0) / nights.length)
    const hrv = nights.filter(n => n.hrv_ms != null)
    lines.push(`Sleep: ${nights.length} nights logged, average ${Math.floor(avg / 60)}h ${avg % 60}m${hrv.length ? `, average HRV ${Math.round(hrv.reduce((s, n) => s + Number(n.hrv_ms), 0) / hrv.length)}` : ''}.`)
  } else lines.push('Sleep: not logged.')
  return lines.join('\n')
}

export const INSIGHT_SYSTEM = `You write a short weekly summary for someone on a GLP-1 medicine, from structured tracking data. UK English, calm, direct, reading age 12. Exactly this shape, no headings, no markdown:
1. One sentence on the week overall.
2. Three findings, one line each, starting with "Weight:", "Protein:", "Sleep:" or the most relevant area. Numbers where they help.
3. One action for next week, starting with "This week:". Pick the single highest-leverage thing.
Never recommend a dose or a change to medication. If a dose is overdue, say to follow the manufacturer guidance shown in the app. If data is thin, say what to log. Under 120 words.`
