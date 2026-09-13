export const DAY_MS = 86_400_000

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const ta = typeof a === 'string' ? new Date(a).getTime() : a.getTime()
  const tb = typeof b === 'string' ? new Date(b).getTime() : b.getTime()
  return (tb - ta) / DAY_MS
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS)
}

export function formatDayShort(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
