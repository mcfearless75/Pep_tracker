// Estimated relative drug level from logged doses using first-order elimination.
// Output is a fraction of the steady-state trough you would reach dosing the
// current amount on schedule. It is an estimate for pattern-spotting, not a
// pharmacokinetic model, and the UI says so.

export type DoseLike = { taken_at: string | Date; dose_mg: number }

export function remainingFraction(hoursSince: number, halfLifeHours: number): number {
  if (hoursSince < 0) return 0
  return Math.pow(0.5, hoursSince / halfLifeHours)
}

/** Sum of dose × remaining fraction across all doses, in mg-equivalents. */
export function drugLevelMg(doses: DoseLike[], halfLifeHours: number, at: Date = new Date()): number {
  const t = at.getTime()
  return doses.reduce((sum, d) => {
    const hours = (t - new Date(d.taken_at).getTime()) / 3_600_000
    return sum + d.dose_mg * remainingFraction(hours, halfLifeHours)
  }, 0)
}

/** Steady-state trough level for `doseMg` given every `intervalHours`. */
export function steadyStateTroughMg(doseMg: number, halfLifeHours: number, intervalHours: number): number {
  const k = remainingFraction(intervalHours, halfLifeHours)
  return (doseMg * k) / (1 - k)
}

/** Level now as a fraction (0..1+) of steady-state trough on the current dose. */
export function levelFraction(
  doses: DoseLike[],
  halfLifeHours: number,
  currentDoseMg: number,
  intervalHours: number,
  at: Date = new Date(),
): number {
  const ss = steadyStateTroughMg(currentDoseMg, halfLifeHours, intervalHours)
  if (ss <= 0) return 0
  return drugLevelMg(doses, halfLifeHours, at) / ss
}

/** Points for a sparkline over the last `days` days, `stepHours` apart. */
export function levelSeries(
  doses: DoseLike[],
  halfLifeHours: number,
  days = 28,
  stepHours = 6,
  end: Date = new Date(),
): { at: Date; mg: number }[] {
  const out: { at: Date; mg: number }[] = []
  const start = end.getTime() - days * 86_400_000
  for (let t = start; t <= end.getTime(); t += stepHours * 3_600_000) {
    const at = new Date(t)
    out.push({ at, mg: drugLevelMg(doses, halfLifeHours, at) })
  }
  return out
}
