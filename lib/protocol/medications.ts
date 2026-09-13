// Licensed GLP-1 medicines available in the UK plus common unlicensed compounds
// people track. Half-lives from the SmPC / published pharmacokinetics. We track
// and educate; we never recommend a dose. Titration ladders here are the
// manufacturer's licensed schedule, shown as reference with the source named.

export type MedicationPreset = {
  key: string
  name: string
  generic: string
  form: 'pen' | 'vial'
  frequency: 'daily' | 'weekly'
  halfLifeHours: number
  licensed: boolean
  ladderMg: number[]        // manufacturer titration steps, each held ~4 weeks
  stepWeeks: number
  source: string
  missedDose: string        // manufacturer wording, paraphrased, with source
}

export const MEDICATIONS: MedicationPreset[] = [
  {
    key: 'mounjaro',
    name: 'Mounjaro',
    generic: 'tirzepatide',
    form: 'pen',
    frequency: 'weekly',
    halfLifeHours: 120,
    licensed: true,
    ladderMg: [2.5, 5, 7.5, 10, 12.5, 15],
    stepWeeks: 4,
    source: 'Mounjaro SmPC (Eli Lilly)',
    missedDose: 'If a dose is missed, take it within 4 days (96 hours). If more than 4 days have passed, skip it and take the next dose on the usual day. Never take two doses within 3 days of each other.',
  },
  {
    key: 'wegovy',
    name: 'Wegovy',
    generic: 'semaglutide',
    form: 'pen',
    frequency: 'weekly',
    halfLifeHours: 168,
    licensed: true,
    ladderMg: [0.25, 0.5, 1, 1.7, 2.4],
    stepWeeks: 4,
    source: 'Wegovy SmPC (Novo Nordisk)',
    missedDose: 'If a dose is missed and the next scheduled dose is more than 2 days away, take it as soon as possible. If the next dose is less than 2 days away, skip it and take the next dose on the usual day.',
  },
  {
    key: 'ozempic',
    name: 'Ozempic',
    generic: 'semaglutide',
    form: 'pen',
    frequency: 'weekly',
    halfLifeHours: 168,
    licensed: true,
    ladderMg: [0.25, 0.5, 1, 2],
    stepWeeks: 4,
    source: 'Ozempic SmPC (Novo Nordisk)',
    missedDose: 'If a dose is missed, take it within 5 days. If more than 5 days have passed, skip it and take the next dose on the usual day.',
  },
  {
    key: 'saxenda',
    name: 'Saxenda',
    generic: 'liraglutide',
    form: 'pen',
    frequency: 'daily',
    halfLifeHours: 13,
    licensed: true,
    ladderMg: [0.6, 1.2, 1.8, 2.4, 3],
    stepWeeks: 1,
    source: 'Saxenda SmPC (Novo Nordisk)',
    missedDose: 'If a dose is missed within 12 hours, take it. Otherwise skip it and take the next dose at the usual time. If more than 3 days are missed, contact your prescriber about restarting.',
  },
  {
    key: 'retatrutide',
    name: 'Retatrutide',
    generic: 'retatrutide',
    form: 'vial',
    frequency: 'weekly',
    halfLifeHours: 144,
    licensed: false,
    ladderMg: [],
    stepWeeks: 0,
    source: 'Not licensed in the UK, US or EU (Phase 3 as of 2026)',
    missedDose: 'There is no licensed guidance for this compound. Speak to a clinician.',
  },
  {
    key: 'other',
    name: 'Other',
    generic: '',
    form: 'vial',
    frequency: 'weekly',
    halfLifeHours: 120,
    licensed: false,
    ladderMg: [],
    stepWeeks: 0,
    source: '',
    missedDose: 'No licensed guidance is available for this compound. Speak to a clinician.',
  },
]

export function findPreset(key: string): MedicationPreset | undefined {
  return MEDICATIONS.find(m => m.key === key)
}

export function presetForName(name: string): MedicationPreset | undefined {
  const n = name.trim().toLowerCase()
  return MEDICATIONS.find(m => m.name.toLowerCase() === n || m.generic === n)
}
