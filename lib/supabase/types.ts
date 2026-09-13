export type InjectionSite =
  | 'abdomen_left' | 'abdomen_right' | 'thigh_left' | 'thigh_right' | 'arm_left' | 'arm_right'

export type SideEffectKind =
  | 'nausea' | 'vomiting' | 'constipation' | 'diarrhoea' | 'fatigue' | 'sulphur_burps'
  | 'dizziness' | 'headache' | 'cycle_change' | 'chills' | 'injection_site' | 'other'

export type Profile = {
  id: string
  display_name: string | null
  units: 'metric' | 'imperial'
  over_18: boolean
  accepted_disclaimer_at: string | null
  goal: 'weight_loss' | 'maintenance' | 'muscle'
  height_cm: number | null
  start_weight_kg: number | null
  protein_g_per_kg: number
  protein_target_g: number | null
  water_target_ml: number
  night_mode_start: string
  night_mode_end: string
  wake_goal: string
  onboarded_at: string | null
}

export type Medication = {
  id: string
  user_id: string
  name: string
  generic: string | null
  form: 'pen' | 'vial'
  dose_mg: number
  frequency: 'daily' | 'weekly' | 'custom'
  interval_days: number
  shot_weekday: number | null
  start_date: string
  half_life_hours: number | null
  licensed: boolean
  active: boolean
  notes: string | null
}

export type TitrationStep = { id: string; medication_id: string; dose_mg: number; start_date: string }

export type Dose = {
  id: string
  medication_id: string
  taken_at: string
  dose_mg: number
  site: InjectionSite | null
  notes: string | null
}

export type WeightLog = { id: string; logged_at: string; weight_kg: number; waist_cm: number | null }
export type SideEffectLog = { id: string; logged_at: string; kind: SideEffectKind; severity: number; notes: string | null }
export type Meal = {
  id: string
  logged_date: string
  logged_at: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number | null
  source: 'photo' | 'barcode' | 'search' | 'manual' | 'repeat'
  confidence: 'low' | 'medium' | 'high' | null
}
export type WaterLog = { id: string; logged_at: string; ml: number }
export type SleepLog = {
  id: string
  night_of: string
  bedtime: string | null
  wake_time: string | null
  duration_min: number | null
  hrv_ms: number | null
  resting_hr: number | null
  quality: number | null
  source: string
}
export type TrainingLog = { id: string; logged_at: string; kind: 'resistance' | 'cardio' | 'walk' | 'other'; minutes: number | null; felt: number | null }
export type MomentRead = { moment_id: string; read_at: string; correct: boolean | null }
export type BloodworkResult = { id: string; taken_on: string; marker: string; value: number; unit: string | null; source: 'manual' | 'photo' | 'pdf'; notes: string | null }
export type Insight = { id: string; week_start: string; body: string; model: string | null; created_at: string }
export type MoodLog = { id: string; logged_at: string; mood: number | null; energy: number | null; notes: string | null }
