import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { NightArc } from '@/components/sleep/NightArc'
import { SleepLogForm } from '@/components/sleep/SleepLogForm'
import { shotNightCorrelation, proteinCorrelation, baseline } from '@/lib/sleep/correlations'
import { isNight } from '@/lib/theme/nightMode'
import { isoDate, addDays, formatTime } from '@/lib/dates'
import type { SleepLog, Dose, Meal, Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function SleepPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const now = new Date()
  const since = isoDate(addDays(now, -30))
  const [sleepQ, dosesQ, mealsQ, profileQ] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', uid).gte('night_of', since).order('night_of', { ascending: false }).returns<SleepLog[]>(),
    supabase.from('doses').select('taken_at').eq('user_id', uid).gte('taken_at', since).returns<Pick<Dose, 'taken_at'>[]>(),
    supabase.from('meals').select('logged_date, protein_g').eq('user_id', uid).gte('logged_date', since).returns<Pick<Meal, 'logged_date' | 'protein_g'>[]>(),
    supabase.from('profiles').select('protein_target_g, night_mode_start, night_mode_end').eq('id', uid).maybeSingle<Pick<Profile, 'protein_target_g' | 'night_mode_start' | 'night_mode_end'>>(),
  ])
  const nights = sleepQ.data ?? []
  const last = nights[0]
  const profile = profileQ.data!
  const proteinByDay = Object.entries((mealsQ.data ?? []).reduce<Record<string, number>>((acc, m) => { acc[m.logged_date] = (acc[m.logged_date] ?? 0) + Number(m.protein_g); return acc }, {}))
    .map(([date, protein_g]) => ({ date, protein_g }))
  const corr = [
    shotNightCorrelation(nights, (dosesQ.data ?? []).map(d => d.taken_at)),
    proteinCorrelation(nights, proteinByDay, profile.protein_target_g ?? 120),
  ].filter((c): c is NonNullable<typeof c> => c != null)
  const hrvBase = baseline(nights.slice(1, 15).map(n => n.hrv_ms == null ? null : Number(n.hrv_ms)))
  const durBase = baseline(nights.slice(1, 15).map(n => n.duration_min))
  const night = isNight(now, profile.night_mode_start.slice(0, 5), profile.night_mode_end.slice(0, 5))

  return (
    <div className="space-y-3">
      <header className="flex justify-between items-end">
        <div><Label>Sleep</Label><h1 className="text-2xl font-extrabold tracking-tight">Last night</h1></div>
        {night && <span className="rounded-chip border border-accent text-accent text-xs font-semibold px-2.5 py-1">☾ Night mode</span>}
      </header>

      <Card>
        {last?.duration_min ? (
          <>
            <NightArc bedtime={last.bedtime} wake={last.wake_time} durationMin={last.duration_min} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Stat label="Duration" value={`${Math.floor(last.duration_min / 60)}h ${last.duration_min % 60}m`} delta={durBase ? last.duration_min - durBase : null} unit="min" />
              <Stat label="HRV" value={last.hrv_ms ? `${Number(last.hrv_ms)} ms` : '—'} delta={hrvBase && last.hrv_ms ? Number(last.hrv_ms) - hrvBase : null} unit="ms" />
              <Stat label="Bedtime" value={last.bedtime ? formatTime(last.bedtime) : '—'} />
              <Stat label="Resting HR" value={last.resting_hr ? `${last.resting_hr} bpm` : '—'} />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">No sleep logged for last night. Add it below, or connect a wearable when that ships.</p>
        )}
      </Card>

      {corr.map(c => (
        <Card key={c.label} className="border-accent/50">
          <Label className="text-accent">Pattern · {c.label} · {c.n_a + c.n_b} nights</Label>
          <p className="text-sm font-semibold mt-1">{c.text}</p>
        </Card>
      ))}
      {corr.length === 0 && nights.length > 0 && (
        <p className="text-xs text-muted px-1">Patterns appear after about ten logged nights, including at least three shot nights.</p>
      )}

      <SleepLogForm userId={uid} />

      {nights.length > 1 && (
        <Card>
          <Label>Last 30 nights</Label>
          <ul className="mt-2 divide-y divide-line text-sm">
            {nights.slice(0, 14).map(n => (
              <li key={n.id} className="py-1.5 flex justify-between"><span>{new Date(n.night_of).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="text-muted">{n.duration_min ? `${Math.floor(n.duration_min / 60)}h ${n.duration_min % 60}m` : '—'}{n.hrv_ms ? ` · HRV ${Number(n.hrv_ms)}` : ''}</span></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value, delta, unit }: { label: string; value: string; delta?: number | null; unit?: string }) {
  return (
    <div className="rounded-chip bg-bg border border-line p-2.5">
      <Label>{label}</Label>
      <p className="text-lg font-extrabold">{value}{delta != null && Math.abs(delta) >= 1 && <span className={`text-xs ml-1 ${delta >= 0 ? 'text-good' : 'text-bad'}`}>{delta > 0 ? '+' : ''}{Math.round(delta)}{unit ? ` ${unit}` : ''}</span>}</p>
    </div>
  )
}
