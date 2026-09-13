import { formatTime } from '@/lib/dates'

/** 180° arc from bedtime to wake. Stages arrive with wearables; for now the arc fills by duration. */
export function NightArc({ bedtime, wake, durationMin }: { bedtime: string | null; wake: string | null; durationMin: number }) {
  const inBed = bedtime && wake ? Math.max(durationMin, (new Date(wake).getTime() - new Date(bedtime).getTime()) / 60000) : durationMin
  const frac = inBed > 0 ? Math.min(1, durationMin / inBed) : 1
  const len = Math.PI * 120
  return (
    <svg viewBox="0 0 280 150" className="w-full max-w-[300px] mx-auto block" role="img" aria-label={`Slept ${Math.floor(durationMin / 60)} hours ${durationMin % 60} minutes`}>
      <path d="M20 130 A120 120 0 0 1 260 130" fill="none" stroke="var(--line)" strokeWidth="18" />
      <path d="M20 130 A120 120 0 0 1 260 130" fill="none" stroke="var(--sleep)" strokeWidth="18" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - frac)} style={{ transition: 'stroke-dashoffset .6s ease-out' }} />
      <text x="140" y="92" textAnchor="middle" fontSize="34" fontWeight="800" fill="var(--text)">{Math.floor(durationMin / 60)}h {durationMin % 60}m</text>
      <text x="140" y="112" textAnchor="middle" fontSize="12" fill="var(--muted)">{inBed > durationMin ? `in bed ${Math.round(inBed / 60 * 10) / 10}h · ${Math.round(frac * 100)}% asleep` : 'asleep'}</text>
      <text x="20" y="150" fontSize="12" fill="var(--muted)">{bedtime ? formatTime(bedtime) : ''}</text>
      <text x="260" y="150" textAnchor="end" fontSize="12" fill="var(--muted)">{wake ? formatTime(wake) : ''}</text>
    </svg>
  )
}
