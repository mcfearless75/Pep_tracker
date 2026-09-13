/** Bedtime that gives `targetMin` of sleep before `wakeGoal` (HH:MM), plus 20 min to fall asleep. */
export function suggestedBedtime(wakeGoal: string, targetMin = 450, latencyMin = 20): string {
  const [h, m] = wakeGoal.split(':').map(Number)
  let mins = h * 60 + m - targetMin - latencyMin
  while (mins < 0) mins += 1440
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

function minutesOfDay(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/** 0 to 100. 100 = every bedtime within 15 min of the median; drops as spread grows. Needs 3+ nights. */
export function consistencyScore(bedtimes: (string | null)[]): number | null {
  const mins = bedtimes.filter((b): b is string => !!b).map(minutesOfDay).map(m => (m < 720 ? m + 1440 : m))
  if (mins.length < 3) return null
  const sorted = [...mins].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const spread = mins.reduce((s, m) => s + Math.abs(m - median), 0) / mins.length
  return Math.max(0, Math.min(100, Math.round(100 - Math.max(0, spread - 15) * 1.5)))
}

export type Readiness = { level: 'green' | 'amber' | 'red'; text: string }

export function readiness(durationMin: number | null, hrv: number | null, hrvBaseline: number | null): Readiness | null {
  if (durationMin == null) return null
  let score = 0
  if (durationMin >= 420) score += 2
  else if (durationMin >= 360) score += 1
  if (hrv != null && hrvBaseline != null) {
    const ratio = hrv / hrvBaseline
    if (ratio >= 0.95) score += 2
    else if (ratio >= 0.8) score += 1
  } else {
    score += 1 // no HRV data: neutral
  }
  if (score >= 4) return { level: 'green', text: 'Recovered. A lift today is a good idea.' }
  if (score >= 2) return { level: 'amber', text: 'Middling. Walk or lift lighter; get to bed on time.' }
  return { level: 'red', text: 'Run down. Rest, protein, water, early night.' }
}
