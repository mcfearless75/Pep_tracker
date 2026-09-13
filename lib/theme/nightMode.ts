/** True when `now` falls inside the night window, which may cross midnight. */
export function isNight(now: Date, start = '21:00', end = '06:00'): boolean {
  const mins = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const s = sh * 60 + sm
  const e = eh * 60 + em
  return s <= e ? mins >= s && mins < e : mins >= s || mins < e
}

export type Mode = 'day' | 'night'
