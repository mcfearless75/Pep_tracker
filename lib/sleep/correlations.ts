import { isoDate } from '@/lib/dates'

export type Night = { night_of: string; duration_min: number | null; hrv_ms?: number | null }

export type Correlation = { label: string; delta_min: number; n_a: number; n_b: number; text: string }

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** Average sleep on shot nights vs other nights. Needs at least 3 of each. */
export function shotNightCorrelation(nights: Night[], doseDates: string[]): Correlation | null {
  const shot = new Set(doseDates.map(d => isoDate(new Date(d))))
  const a = nights.filter(n => n.duration_min != null && shot.has(n.night_of)).map(n => n.duration_min!)
  const b = nights.filter(n => n.duration_min != null && !shot.has(n.night_of)).map(n => n.duration_min!)
  if (a.length < 3 || b.length < 3) return null
  const delta = Math.round(avg(a) - avg(b))
  const abs = Math.abs(delta)
  const text = abs < 15
    ? 'Shot nights and other nights look about the same for you.'
    : delta < 0
      ? `On shot nights you sleep ${abs} min less. If that holds, try dosing earlier in the day.`
      : `On shot nights you sleep ${abs} min more. Nothing to change.`
  return { label: 'Shot night', delta_min: delta, n_a: a.length, n_b: b.length, text }
}

/** Sleep on days protein target was hit vs missed. */
export function proteinCorrelation(nights: Night[], proteinByDay: { date: string; protein_g: number }[], targetG: number): Correlation | null {
  const hit = new Set(proteinByDay.filter(p => p.protein_g >= targetG).map(p => p.date))
  const logged = new Set(proteinByDay.filter(p => p.protein_g > 0).map(p => p.date))
  const a = nights.filter(n => n.duration_min != null && hit.has(n.night_of)).map(n => n.duration_min!)
  const b = nights.filter(n => n.duration_min != null && logged.has(n.night_of) && !hit.has(n.night_of)).map(n => n.duration_min!)
  if (a.length < 3 || b.length < 3) return null
  const delta = Math.round(avg(a) - avg(b))
  const abs = Math.abs(delta)
  const text = abs < 15
    ? 'Protein target hit or missed does not seem to change your sleep.'
    : delta > 0
      ? `You sleep ${abs} min more on days you hit protein. Worth keeping.`
      : `You sleep ${abs} min less on days you hit protein. Check whether the last meal is too late.`
  return { label: 'Protein target', delta_min: delta, n_a: a.length, n_b: b.length, text }
}

export function baseline(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number')
  return xs.length >= 3 ? Math.round(avg(xs) * 10) / 10 : null
}
