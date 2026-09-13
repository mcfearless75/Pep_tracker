export type Units = 'metric' | 'imperial'

export function formatWeight(kg: number, units: Units): string {
  if (units === 'imperial') {
    const lb = kg * 2.20462
    const st = Math.floor(lb / 14)
    return `${st} st ${Math.round(lb - st * 14)} lb`
  }
  return `${Math.round(kg * 10) / 10} kg`
}

export function formatLength(cm: number, units: Units): string {
  return units === 'imperial' ? `${Math.round(cm / 2.54 * 10) / 10} in` : `${Math.round(cm * 10) / 10} cm`
}

/** Parse a weight typed in the user's units into kg. Imperial accepts "12 st 4", "12st4lb" or plain lb. */
export function parseWeightToKg(input: string, units: Units): number | null {
  const s = input.trim().toLowerCase()
  if (!s) return null
  if (units === 'metric') { const v = parseFloat(s); return v > 0 ? v : null }
  const st = s.match(/(\d+(?:\.\d+)?)\s*st/)
  const lb = s.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs)?(?!\s*st)\s*$/)
  let totalLb = 0
  if (st) totalLb += parseFloat(st[1]) * 14
  if (st && lb && lb.index! > st.index!) totalLb += parseFloat(lb[1])
  if (!st) { const v = parseFloat(s); if (!(v > 0)) return null; totalLb = v }
  return totalLb > 0 ? Math.round(totalLb / 2.20462 * 100) / 100 : null
}
