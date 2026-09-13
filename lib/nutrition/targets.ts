// Protein target: body weight × a g/kg band the user picks with their
// prescriber. 1.2 to 1.6 g/kg is the range commonly cited for preserving lean
// mass during GLP-1 weight loss. Floor at 90 g so a low body weight never
// produces a target that would itself cause muscle loss.

export const PROTEIN_BANDS = [
  { value: 1.2, label: '1.2 g/kg', note: 'minimum while losing weight' },
  { value: 1.4, label: '1.4 g/kg', note: 'default' },
  { value: 1.6, label: '1.6 g/kg', note: 'if you lift 2+ times a week' },
] as const

export function proteinTargetG(weightKg: number, gPerKg = 1.4): number {
  if (!(weightKg > 0)) return 100
  return Math.max(90, Math.round(weightKg * gPerKg))
}

/** Exponential moving average of weight so daily noise does not drive decisions. */
export function weightEma(logs: { logged_at: string; weight_kg: number }[], alpha = 0.25): { logged_at: string; ema: number }[] {
  const sorted = [...logs].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
  let ema: number | null = null
  return sorted.map(l => {
    ema = ema == null ? l.weight_kg : alpha * l.weight_kg + (1 - alpha) * ema
    return { logged_at: l.logged_at, ema: Math.round(ema * 100) / 100 }
  })
}
