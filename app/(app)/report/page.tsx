import { createClient } from '@/lib/supabase/server'
import { PrintButton } from './PrintButton'
import { MARKERS } from '@/lib/bloodwork/markers'
import { siteLabel } from '@/lib/protocol/sites'
import { weightEma } from '@/lib/nutrition/targets'
import { addDays, formatDayShort, isoDate } from '@/lib/dates'
import type { Profile, Medication, Dose, WeightLog, SideEffectLog, SleepLog, BloodworkResult, TitrationStep } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

/** One-page summary for a prescriber or GP. Print to PDF from the browser. */
export default async function ReportPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const now = new Date()
  const since90 = addDays(now, -90).toISOString()
  const [p, meds, steps, doses, weights, se, sleep, bloods, meals] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', uid).maybeSingle<Profile>(),
    supabase.from('medications').select('*').eq('user_id', uid).eq('active', true).returns<Medication[]>(),
    supabase.from('titration_steps').select('*').eq('user_id', uid).order('start_date').returns<TitrationStep[]>(),
    supabase.from('doses').select('*').eq('user_id', uid).gte('taken_at', since90).order('taken_at', { ascending: false }).returns<Dose[]>(),
    supabase.from('weight_logs').select('*').eq('user_id', uid).gte('logged_at', since90).order('logged_at').returns<WeightLog[]>(),
    supabase.from('side_effect_logs').select('*').eq('user_id', uid).gte('logged_at', since90).order('logged_at', { ascending: false }).returns<SideEffectLog[]>(),
    supabase.from('sleep_logs').select('*').eq('user_id', uid).gte('night_of', isoDate(addDays(now, -28))).returns<SleepLog[]>(),
    supabase.from('bloodwork_results').select('*').eq('user_id', uid).order('taken_on', { ascending: false }).returns<BloodworkResult[]>(),
    supabase.from('meals').select('logged_date, protein_g').eq('user_id', uid).gte('logged_date', isoDate(addDays(now, -28))),
  ])
  const profile = p.data!
  const ws = (weights.data ?? []).map(w => ({ ...w, weight_kg: Number(w.weight_kg) }))
  const ema = weightEma(ws)
  const seCounts = (se.data ?? []).reduce<Record<string, number>>((a, s) => { a[s.kind] = (a[s.kind] ?? 0) + 1; return a }, {})
  const nights = (sleep.data ?? []).filter(n => n.duration_min)
  const avgSleep = nights.length ? Math.round(nights.reduce((s, n) => s + n.duration_min!, 0) / nights.length) : null
  const proteinDays = Object.values((meals.data ?? []).reduce<Record<string, number>>((a, m) => { a[m.logged_date] = (a[m.logged_date] ?? 0) + Number(m.protein_g); return a }, {}))
  const latestBloods = MARKERS.map(m => ({ m, r: (bloods.data ?? []).find(b => b.marker === m.key) })).filter(x => x.r)

  return (
    <div className="space-y-4 print:text-black">
      <div className="flex justify-between items-center print:hidden">
        <a href="/settings" className="text-sm text-muted">‹ Settings</a>
        <PrintButton />
      </div>
      <header className="border-b border-line pb-3">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted">Tracked · summary for your prescriber</p>
        <h1 className="text-xl font-extrabold">{profile.display_name ?? 'Patient'} · {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h1>
        <p className="text-xs text-muted">Self-reported data from the Tracked app. Last 90 days unless stated. Not a clinical record.</p>
      </header>

      <section className="text-sm">
        <h2 className="font-bold">Medication</h2>
        {(meds.data ?? []).map(m => (
          <p key={m.id}>{m.name}{m.generic ? ` (${m.generic})` : ''}, {Number(m.dose_mg)} mg, {m.frequency}, started {formatDayShort(m.start_date)}{m.licensed ? '' : ' — unlicensed compound'}.
            {(steps.data ?? []).filter(s => s.medication_id === m.id).map(s => ` Stepped to ${Number(s.dose_mg)} mg on ${formatDayShort(s.start_date)}.`).join('')}</p>
        ))}
        <p className="text-muted">{(doses.data ?? []).length} doses logged in 90 days. Last: {doses.data?.[0] ? `${formatDayShort(doses.data[0].taken_at)}, ${siteLabel(doses.data[0].site)}` : 'none'}.</p>
      </section>

      <section className="text-sm">
        <h2 className="font-bold">Weight</h2>
        {ema.length >= 2 ? <p>Trend {ema[0].ema} kg → {ema[ema.length - 1].ema} kg over {ws.length} readings ({(ema[ema.length - 1].ema - ema[0].ema).toFixed(1)} kg). Start weight on record: {profile.start_weight_kg ?? '—'} kg.</p> : <p className="text-muted">Fewer than two readings.</p>}
      </section>

      <section className="text-sm">
        <h2 className="font-bold">Side effects (90 days)</h2>
        {Object.keys(seCounts).length === 0 ? <p className="text-muted">None logged.</p> : <p>{Object.entries(seCounts).map(([k, n]) => `${k.replace('_', ' ')} ×${n}`).join(', ')}.</p>}
      </section>

      <section className="text-sm">
        <h2 className="font-bold">Nutrition and sleep (28 days)</h2>
        <p>Protein target {profile.protein_target_g ?? '—'} g/day; logged on {proteinDays.length} days, hit on {proteinDays.filter(v => v >= (profile.protein_target_g ?? 9999)).length}. {avgSleep != null ? `Sleep averaged ${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m over ${nights.length} nights.` : 'Sleep not logged.'}</p>
      </section>

      {latestBloods.length > 0 && (
        <section className="text-sm">
          <h2 className="font-bold">Latest bloodwork</h2>
          <table className="w-full text-xs mt-1"><tbody>
            {latestBloods.map(({ m, r }) => <tr key={m.key} className="border-t border-line"><td className="py-1">{m.label}</td><td className="py-1 text-right font-semibold">{Number(r!.value)} {r!.unit ?? m.unit}</td><td className="py-1 text-right text-muted">{formatDayShort(r!.taken_on)}</td></tr>)}
          </tbody></table>
        </section>
      )}
      <p className="text-[11px] text-muted">Generated by Tracked. The app tracks and educates; it never recommends a dose.</p>
    </div>
  )
}
