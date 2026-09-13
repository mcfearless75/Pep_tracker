// Demo dataset: ten weeks on Mounjaro, generated relative to now.
// Used only when TRACKED_DEMO=1 (screenshots, store review, sales demos).

export const DEMO_USER_ID = '00000000-0000-4000-8000-00000000demo'
const DAY = 86_400_000
const day = (n: number) => new Date(Date.now() - n * DAY)
const at = (n: number, h: number, m = 0) => { const d = day(n); d.setHours(h, m, 0, 0); return d }
const iso = (d: Date) => d.toISOString()
const dateStr = (n: number) => day(n).toISOString().slice(0, 10)
const uid = DEMO_USER_ID
const medId = 'med-demo'
const sites = ['abdomen_left', 'abdomen_right', 'thigh_left', 'thigh_right', 'arm_left', 'arm_right']

export function buildDemo(night = false): Record<string, Record<string, unknown>[]> {
  let id = 0
  const nid = () => `demo-${++id}`
  const profiles = [{
    id: uid, display_name: 'Paul', units: 'metric', over_18: true, accepted_disclaimer_at: iso(day(63)), goal: 'weight_loss', height_cm: 180,
    start_weight_kg: 96.4, protein_g_per_kg: 1.4, protein_target_g: 132, water_target_ml: 2000,
    night_mode_start: night ? '00:00' : '21:00', night_mode_end: night ? '23:59' : '06:00', wake_goal: '06:45', onboarded_at: iso(day(63)), created_at: iso(day(63)),
  }]
  const medications = [{ id: medId, user_id: uid, name: 'Mounjaro', generic: 'tirzepatide', form: 'pen', dose_mg: 5, frequency: 'weekly', interval_days: 7, shot_weekday: day(62).getDay(), start_date: dateStr(63), half_life_hours: 120, licensed: true, active: true, notes: null, created_at: iso(day(63)) }]
  const titration_steps = [{ id: nid(), user_id: uid, medication_id: medId, dose_mg: 5, start_date: dateStr(34) }]
  const doses: Record<string, unknown>[] = []
  for (let i = 0; i < 9; i++) { const n = 62 - i * 7; if (n < 8) break; doses.push({ id: nid(), user_id: uid, medication_id: medId, taken_at: iso(at(n, 8, 30)), dose_mg: n > 34 ? 2.5 : 5, site: sites[i % 6], notes: null }) }
  doses.push({ id: nid(), user_id: uid, medication_id: medId, taken_at: iso(at(5, 8, 30)), dose_mg: 5, site: sites[doses.length % 6], notes: null })
  const weight_logs: Record<string, unknown>[] = []
  for (let n = 62; n >= 0; n -= 2) weight_logs.push({ id: nid(), user_id: uid, logged_at: iso(at(n, 7, 10)), weight_kg: +(96.4 - (62 - n) * 0.085 + Math.sin(n) * 0.5).toFixed(1), waist_cm: n % 14 === 0 ? +(104 - (62 - n) * 0.08).toFixed(1) : null })
  const side_effect_logs = [
    { id: nid(), user_id: uid, logged_at: iso(at(33, 19)), kind: 'nausea', severity: 2, notes: null },
    { id: nid(), user_id: uid, logged_at: iso(at(32, 9)), kind: 'nausea', severity: 1, notes: null },
    { id: nid(), user_id: uid, logged_at: iso(at(31, 14)), kind: 'fatigue', severity: 1, notes: null },
    { id: nid(), user_id: uid, logged_at: iso(at(12, 20)), kind: 'constipation', severity: 1, notes: null },
    { id: nid(), user_id: uid, logged_at: iso(at(4, 18)), kind: 'sulphur_burps', severity: 1, notes: null },
  ]
  const training_logs = [9, 6, 3].map(n => ({ id: nid(), user_id: uid, logged_at: iso(at(n, 18)), kind: 'resistance', minutes: 30, felt: 4 }))
  training_logs.push({ id: nid(), user_id: uid, logged_at: iso(at(1, 12)), kind: 'walk', minutes: 40, felt: 4 })
  const mood_logs = [{ id: nid(), user_id: uid, logged_at: iso(at(1, 21)), mood: 4, energy: 3, notes: null }]
  const template = [
    { meal_type: 'breakfast', food_name: 'Greek yoghurt, berries and granola', calories: 320, protein_g: 24, carbs_g: 38, fat_g: 8, fibre_g: 5, source: 'photo', confidence: 'high', h: 7, m: 55 },
    { meal_type: 'lunch', food_name: 'Grilled chicken and rice bowl', calories: 560, protein_g: 42, carbs_g: 58, fat_g: 14, fibre_g: 4, source: 'photo', confidence: 'high', h: 13, m: 5 },
    { meal_type: 'snack', food_name: 'Whey protein shake', calories: 160, protein_g: 25, carbs_g: 6, fat_g: 3, fibre_g: 1, source: 'search', confidence: null, h: 16, m: 20 },
  ]
  const meals: Record<string, unknown>[] = []
  const nowH = new Date().getHours()
  for (let n = 13; n >= 0; n--) {
    for (const t of template) {
      if (n === 0 && t.h > nowH) continue
      meals.push({ id: nid(), user_id: uid, logged_date: dateStr(n), logged_at: iso(at(n, t.h, t.m)), meal_type: t.meal_type, food_name: t.food_name, calories: t.calories, protein_g: t.protein_g + (n % 3), carbs_g: t.carbs_g, fat_g: t.fat_g, fibre_g: t.fibre_g, source: t.source, confidence: t.confidence })
    }
    if (n > 0 && n % 2 === 0) meals.push({ id: nid(), user_id: uid, logged_date: dateStr(n), logged_at: iso(at(n, 19, 10)), meal_type: 'dinner', food_name: 'Salmon, new potatoes and greens', calories: 520, protein_g: 38, carbs_g: 34, fat_g: 22, fibre_g: 6, source: 'photo', confidence: 'medium' })
  }
  const water_logs: Record<string, unknown>[] = []
  for (let n = 13; n >= 0; n--) for (let k = 0; k < (n === 0 ? 5 : 7); k++) water_logs.push({ id: nid(), user_id: uid, logged_at: iso(at(n, 8 + k * 2)), ml: 250 })
  const shotDates = new Set(doses.map(d => String(d.taken_at).slice(0, 10)))
  const sleep_logs: Record<string, unknown>[] = []
  for (let n = 27; n >= 1; n--) {
    const dur = (shotDates.has(dateStr(n)) ? 395 : 438) + Math.round(Math.sin(n * 1.7) * 18)
    const bed = at(n, 23, 5 + (n % 3) * 10)
    sleep_logs.push({ id: nid(), user_id: uid, night_of: dateStr(n), bedtime: iso(bed), wake_time: iso(new Date(bed.getTime() + (dur + 22) * 60000)), duration_min: dur, hrv_ms: 48 + Math.round(Math.cos(n) * 6), resting_hr: 60 + (n % 3), quality: 3 + (n % 2), source: 'manual', created_at: iso(bed) })
  }
  const b = (n: number, marker: string, value: number, unit: string, source = 'pdf') => ({ id: nid(), user_id: uid, taken_on: dateStr(n), marker, value, unit, source, notes: null, created_at: iso(day(n)) })
  const bloodwork_results = [
    b(70, 'hba1c', 44, 'mmol/mol', 'manual'), b(7, 'hba1c', 39, 'mmol/mol'), b(70, 'ldl', 3.6, 'mmol/L', 'manual'), b(7, 'ldl', 3.1, 'mmol/L'),
    b(7, 'hdl', 1.2, 'mmol/L'), b(7, 'triglycerides', 1.4, 'mmol/L'), b(70, 'alt', 52, 'U/L', 'manual'), b(7, 'alt', 38, 'U/L'),
    b(7, 'ferritin', 26, 'µg/L'), b(7, 'vit_d', 41, 'nmol/L'), b(7, 'crp', 2.1, 'mg/L'),
  ]
  const moment_reads = [
    { user_id: uid, moment_id: 'how-glp1-works', read_at: iso(day(60)), correct: true },
    { user_id: uid, moment_id: 'site-rotation', read_at: iso(day(59)), correct: true },
    { user_id: uid, moment_id: 'step-up-72h', read_at: iso(day(33)), correct: true },
  ]
  const monday = (() => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10) })()
  const insights = [{ id: nid(), user_id: uid, week_start: monday, model: 'demo', created_at: iso(day(0)), body:
`Steady week: weight trend down, protein mostly on target, one soft night.
Weight: 91.2 kg trend, down 0.6 kg on last week and 5.2 kg since you started.
Protein: hit 132 g on 5 of 7 logged days; the two misses were shot day and the day after.
Sleep: averaged 7h 10m, but the night after your shot was 6h 35m, your shortest.
This week: move the shot to the morning and log your sleep the night after so we can see if it helps.` }]
  return { profiles, medications, titration_steps, doses, weight_logs, side_effect_logs, training_logs, mood_logs, meals, water_logs, sleep_logs, bloodwork_results, moment_reads, insights }
}
