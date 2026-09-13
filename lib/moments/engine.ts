import { MOMENTS } from './content'
import type { Moment, TriggerEvent } from './types'
import { DAY_MS } from '@/lib/dates'
import { weightEma } from '@/lib/nutrition/targets'

export type Snapshot = {
  now: Date
  onboarded: boolean
  medications: { licensed: boolean; form: 'pen' | 'vial'; start_date: string; interval_days: number }[]
  doses: { taken_at: string; dose_mg: number }[]
  titrationSteps: { start_date: string }[]
  sideEffects: { logged_at: string; kind: string }[]
  proteinByDay: { date: string; protein_g: number }[]   // last 7 days, oldest first
  proteinTargetG: number
  training: { logged_at: string }[]
  weights: { logged_at: string; weight_kg: number }[]
  sleep: { night_of: string; duration_min: number | null }[]
  isShotDay: boolean
  nightModeActive: boolean
  reads: { moment_id: string; read_at: string }[]
  bloodworkAddedAt?: string[]
}

/** Derive which trigger events are currently true from the user's data. */
export function activeEvents(s: Snapshot): Set<TriggerEvent> {
  const ev = new Set<TriggerEvent>()
  const t = s.now.getTime()
  const within = (iso: string, days: number) => t - new Date(iso).getTime() <= days * DAY_MS

  if (s.onboarded) ev.add('onboarding_complete')
  if (s.doses.length === 1) ev.add('first_shot_logged')
  if (s.medications.some(m => m.form === 'vial')) ev.add('first_vial_added')
  if (s.medications.some(m => !m.licensed)) ev.add('unlicensed_compound_added')
  if (s.titrationSteps.some(st => within(st.start_date, 3) && new Date(st.start_date).getTime() <= t)) ev.add('titration_step_up')

  const recent = (kind: string) => s.sideEffects.some(e => e.kind === kind && within(e.logged_at, 1))
  if (recent('nausea') || recent('vomiting')) ev.add('side_effect_nausea')
  if (recent('constipation')) ev.add('side_effect_constipation')
  if (recent('fatigue')) ev.add('side_effect_fatigue')

  const last3 = s.proteinByDay.slice(-3)
  if (last3.length === 3 && last3.every(d => d.protein_g < s.proteinTargetG * 0.8)) ev.add('protein_under_target_3_days')

  const anyTraining14 = s.training.some(tr => within(tr.logged_at, 14))
  const onProtocol14 = s.medications.length > 0 && s.medications.some(m => !within(m.start_date, 14))
  if (onProtocol14 && !anyTraining14 && s.doses.length >= 2) ev.add('no_training_14_days')

  const ema = weightEma(s.weights.filter(w => within(w.logged_at, 21)))
  if (ema.length >= 6 && Math.abs(ema[ema.length - 1].ema - ema[0].ema) < 0.3) ev.add('weight_plateau_21_days')

  const lastNights = [...s.sleep].sort((a, b) => a.night_of.localeCompare(b.night_of)).slice(-3)
  if (lastNights.length === 3 && lastNights.every(n => (n.duration_min ?? 999) < 360)) ev.add('sleep_under_6h_3_nights')

  const lastDose = s.doses.map(d => new Date(d.taken_at).getTime()).sort((a, b) => b - a)[0]
  const med = s.medications[0]
  if (lastDose && med && t - lastDose > (med.interval_days + 1) * DAY_MS) ev.add('missed_dose')

  if (med && t - new Date(med.start_date).getTime() >= 84 * DAY_MS) ev.add('week_12_reached')
  if (s.isShotDay) ev.add('shot_day')
  if ((s.bloodworkAddedAt ?? []).some(b => within(b, 2))) ev.add('bloodwork_added')
  if (s.nightModeActive) ev.add('night_mode_first')

  return ev
}

/** Pick today's Moment: highest priority active trigger not inside its cooldown. */
export function pickMoment(s: Snapshot, moments: Moment[] = MOMENTS): Moment | null {
  const events = activeEvents(s)
  const readAt = new Map(s.reads.map(r => [r.moment_id, new Date(r.read_at).getTime()]))
  const candidates = moments.filter(m => {
    if (!events.has(m.trigger)) return false
    const last = readAt.get(m.id)
    if (last == null) return true
    return s.now.getTime() - last > m.cooldownDays * DAY_MS
  })
  candidates.sort((a, b) => b.priority - a.priority || a.readSeconds - b.readSeconds)
  return candidates[0] ?? null
}
