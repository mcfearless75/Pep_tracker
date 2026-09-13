export type TriggerEvent =
  | 'onboarding_complete'
  | 'first_shot_logged'
  | 'first_vial_added'
  | 'titration_step_up'
  | 'side_effect_nausea'
  | 'side_effect_constipation'
  | 'side_effect_fatigue'
  | 'protein_under_target_3_days'
  | 'no_training_14_days'
  | 'weight_plateau_21_days'
  | 'sleep_under_6h_3_nights'
  | 'missed_dose'
  | 'unlicensed_compound_added'
  | 'week_12_reached'
  | 'night_mode_first'
  | 'shot_day'
  | 'bloodwork_added'

export type MomentCheck = {
  question: string
  options: string[]
  correct: number
  explain: string
}

export type Moment = {
  id: string
  title: string
  hook: string
  readSeconds: number
  trigger: TriggerEvent
  priority: 1 | 2 | 3 | 4 | 5
  cooldownDays: number
  tag: 'starting' | 'injections' | 'side_effects' | 'protein' | 'muscle' | 'sleep' | 'plateaus' | 'peptides' | 'app'
  body: string[]           // paragraphs; a leading **Label:** is rendered bold
  prescriberPrompt?: string
  sources: string[]
  check?: MomentCheck
  guideId?: string
}
