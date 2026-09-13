// UK-typical panel. Reference ranges are adult guides from NHS lab norms and
// NICE; labs vary, so the app shows the range as context and always points
// the user at their GP for interpretation.

export type Marker = {
  key: string
  label: string
  unit: string
  low?: number      // below this is flagged low
  high?: number     // above this is flagged high
  group: 'Metabolic' | 'Lipids' | 'Liver and kidney' | 'Thyroid' | 'Vitamins and iron' | 'Hormones' | 'Inflammation'
  why: string
  askGp: string
}

export const MARKERS: Marker[] = [
  { key: 'hba1c', label: 'HbA1c', unit: 'mmol/mol', high: 41, group: 'Metabolic', why: 'Three-month average blood sugar. GLP-1 medicines usually bring this down.', askGp: 'Ask what your target is and how often to re-test.' },
  { key: 'fasting_glucose', label: 'Fasting glucose', unit: 'mmol/L', low: 3.9, high: 5.9, group: 'Metabolic', why: 'Blood sugar after an overnight fast.', askGp: 'Ask whether HbA1c is a better marker for you.' },
  { key: 'total_chol', label: 'Total cholesterol', unit: 'mmol/L', high: 5, group: 'Lipids', why: 'Overall cholesterol. Weight loss usually improves it.', askGp: 'Ask about your QRISK score rather than this number alone.' },
  { key: 'ldl', label: 'LDL cholesterol', unit: 'mmol/L', high: 3, group: 'Lipids', why: 'The "bad" fraction most linked to heart disease.', askGp: 'Ask whether a non-HDL or ApoB test would add anything.' },
  { key: 'hdl', label: 'HDL cholesterol', unit: 'mmol/L', low: 1, group: 'Lipids', why: 'The "good" fraction. Exercise raises it.', askGp: 'Ask how your ratio looks, not just this number.' },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mmol/L', high: 1.7, group: 'Lipids', why: 'Blood fats. Sugar, alcohol and excess weight push them up.', askGp: 'Ask whether the sample was fasting.' },
  { key: 'alt', label: 'ALT', unit: 'U/L', high: 40, group: 'Liver and kidney', why: 'Liver enzyme. Fatty liver is common with excess weight and improves as it comes off.', askGp: 'If raised, ask about a liver ultrasound or FIB-4 score.' },
  { key: 'egfr', label: 'eGFR', unit: 'mL/min', low: 90, group: 'Liver and kidney', why: 'Kidney filtration estimate. Relevant to protein targets and dehydration.', askGp: 'If under 60, ask before raising protein above 1.2 g/kg.' },
  { key: 'tsh', label: 'TSH', unit: 'mU/L', low: 0.4, high: 4, group: 'Thyroid', why: 'Thyroid signal. Out of range can affect weight and energy.', askGp: 'Ask whether free T4 was measured too.' },
  { key: 'b12', label: 'Vitamin B12', unit: 'ng/L', low: 200, group: 'Vitamins and iron', why: 'Low B12 causes fatigue and tingling. Reduced food intake can lower it.', askGp: 'Ask about supplementing if you eat little meat or dairy.' },
  { key: 'ferritin', label: 'Ferritin', unit: 'µg/L', low: 30, high: 300, group: 'Vitamins and iron', why: 'Iron stores. Low ferritin is a common cause of fatigue, especially in women.', askGp: 'If low, ask about the cause before supplementing.' },
  { key: 'vit_d', label: 'Vitamin D', unit: 'nmol/L', low: 50, group: 'Vitamins and iron', why: 'Bone, muscle and immune health. Most UK adults are low in winter.', askGp: 'Ask about a daily 10 µg supplement from October to March.' },
  { key: 'testosterone', label: 'Testosterone (total)', unit: 'nmol/L', low: 8.6, high: 29, group: 'Hormones', why: 'Weight loss often raises it in men. Morning sample matters.', askGp: 'Ask whether the sample was taken before 11 am.' },
  { key: 'crp', label: 'CRP', unit: 'mg/L', high: 5, group: 'Inflammation', why: 'General inflammation marker. Falls as body fat falls.', askGp: 'A raised result with no illness is worth a repeat in a few weeks.' },
]

export function markerByKey(key: string): Marker | undefined {
  return MARKERS.find(m => m.key === key)
}

export type RangeStatus = 'low' | 'in_range' | 'high' | 'unknown'

export function rangeStatus(marker: Marker | undefined, value: number): RangeStatus {
  if (!marker) return 'unknown'
  if (marker.low != null && value < marker.low) return 'low'
  if (marker.high != null && value > marker.high) return 'high'
  return 'in_range'
}

export function rangeLabel(marker: Marker): string {
  if (marker.low != null && marker.high != null) return `${marker.low} to ${marker.high} ${marker.unit}`
  if (marker.low != null) return `over ${marker.low} ${marker.unit}`
  if (marker.high != null) return `under ${marker.high} ${marker.unit}`
  return marker.unit
}
