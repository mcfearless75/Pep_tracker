import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { Ring } from '@/components/ui/Ring'
import { ShotCard } from '@/components/today/ShotCard'
import { QuickLog } from '@/components/today/QuickLog'
import { MomentCard } from '@/components/today/MomentCard'
import { InsightCard } from '@/components/today/InsightCard'
import { pickMoment } from '@/lib/moments/engine'
import { isNight } from '@/lib/theme/nightMode'
import { isoDate, addDays } from '@/lib/dates'
import { nextDue, dueState, daysUntil, weekOnProtocol } from '@/lib/protocol/schedule'
import { nextSite } from '@/lib/protocol/sites'
import { proteinTargetG } from '@/lib/nutrition/targets'
import type { Medication, Dose, Profile, Meal, WaterLog, SleepLog, WeightLog, SideEffectLog, TrainingLog, TitrationStep, MomentRead, Insight, BloodworkResult } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const now = new Date()
  const today = isoDate(now)
  const since7 = addDays(now, -7).toISOString()
  const since21 = addDays(now, -21).toISOString()

  const [profileQ, medsQ, dosesQ, mealsQ, waterQ, sleepQ, weightsQ, seQ, trainQ, stepsQ, readsQ, insightQ, bloodsQ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', uid).maybeSingle<Profile>(),
    supabase.from('medications').select('*').eq('user_id', uid).eq('active', true).order('created_at').returns<Medication[]>(),
    supabase.from('doses').select('id, medication_id, taken_at, dose_mg, site, notes').eq('user_id', uid).order('taken_at', { ascending: false }).limit(60).returns<Dose[]>(),
    supabase.from('meals').select('logged_date, protein_g, calories').eq('user_id', uid).gte('logged_date', isoDate(addDays(now, -7))).returns<Pick<Meal, 'logged_date' | 'protein_g' | 'calories'>[]>(),
    supabase.from('water_logs').select('ml').eq('user_id', uid).gte('logged_at', today).returns<Pick<WaterLog, 'ml'>[]>(),
    supabase.from('sleep_logs').select('night_of, duration_min, hrv_ms').eq('user_id', uid).order('night_of', { ascending: false }).limit(3).returns<Pick<SleepLog, 'night_of' | 'duration_min' | 'hrv_ms'>[]>(),
    supabase.from('weight_logs').select('logged_at, weight_kg').eq('user_id', uid).gte('logged_at', since21).order('logged_at').returns<Pick<WeightLog, 'logged_at' | 'weight_kg'>[]>(),
    supabase.from('side_effect_logs').select('logged_at, kind').eq('user_id', uid).gte('logged_at', since7).returns<Pick<SideEffectLog, 'logged_at' | 'kind'>[]>(),
    supabase.from('training_logs').select('logged_at').eq('user_id', uid).gte('logged_at', addDays(now, -14).toISOString()).returns<Pick<TrainingLog, 'logged_at'>[]>(),
    supabase.from('titration_steps').select('start_date').eq('user_id', uid).returns<Pick<TitrationStep, 'start_date'>[]>(),
    supabase.from('moment_reads').select('moment_id, read_at').eq('user_id', uid).returns<Pick<MomentRead, 'moment_id' | 'read_at'>[]>(),
    supabase.from('insights').select('body, week_start').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle<Pick<Insight, 'body' | 'week_start'>>(),
    supabase.from('bloodwork_results').select('created_at').eq('user_id', uid).gte('created_at', since7).returns<{ created_at: string }[]>(),
  ])

  const profile = profileQ.data!
  const meds = medsQ.data ?? []
  const doses = dosesQ.data ?? []
  const med = meds[0]
  const medDoses = med ? doses.filter(d => d.medication_id === med.id) : []
  const lastDose = medDoses[0]
  const due = med ? nextDue(med, lastDose) : null
  const state = med && due ? dueState(due, lastDose, now) : null
  const isShotDay = state === 'due_today' || state === 'taken_today'

  const latestWeight = weightsQ.data?.[weightsQ.data.length - 1]?.weight_kg ?? profile.start_weight_kg ?? 0
  const proteinTarget = profile.protein_target_g ?? proteinTargetG(latestWeight, profile.protein_g_per_kg)
  const proteinToday = (mealsQ.data ?? []).filter(m => m.logged_date === today).reduce((s, m) => s + Number(m.protein_g), 0)
  const waterToday = (waterQ.data ?? []).reduce((s, w) => s + w.ml, 0)

  const proteinByDay = Array.from({ length: 7 }, (_, i) => {
    const d = isoDate(addDays(now, i - 6))
    return { date: d, protein_g: (mealsQ.data ?? []).filter(m => m.logged_date === d).reduce((s, m) => s + Number(m.protein_g), 0) }
  })

  const nightActive = isNight(now, profile.night_mode_start.slice(0, 5), profile.night_mode_end.slice(0, 5))
  const moment = pickMoment({
    now,
    onboarded: !!profile.onboarded_at,
    medications: meds.map(m => ({ licensed: m.licensed, form: m.form, start_date: m.start_date, interval_days: m.interval_days })),
    doses: doses.map(d => ({ taken_at: d.taken_at, dose_mg: Number(d.dose_mg) })),
    titrationSteps: stepsQ.data ?? [],
    sideEffects: seQ.data ?? [],
    proteinByDay,
    proteinTargetG: proteinTarget,
    training: trainQ.data ?? [],
    weights: (weightsQ.data ?? []).map(w => ({ logged_at: w.logged_at, weight_kg: Number(w.weight_kg) })),
    sleep: sleepQ.data ?? [],
    isShotDay,
    nightModeActive: nightActive,
    reads: readsQ.data ?? [],
    bloodworkAddedAt: (bloodsQ.data ?? []).map(b => b.created_at),
  })

  const lastSleep = sleepQ.data?.[0]
  const greeting = now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'

  return (
    <div className="space-y-3">
      <header className="flex justify-between items-end">
        <div>
          <Label>{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</Label>
          <h1 className="text-2xl font-extrabold tracking-tight">{greeting}{profile.display_name ? `, ${profile.display_name}` : ''}</h1>
        </div>
        <Link href="/settings" className="text-xs font-semibold text-muted pb-1">Settings</Link>
      </header>

      {med && due && state ? (
        <ShotCard
          med={med}
          due={due.toISOString()}
          state={state}
          daysUntil={daysUntil(due, now)}
          week={weekOnProtocol(med.start_date, now)}
          suggestedSite={nextSite(medDoses)}
          lastSite={lastDose?.site ?? null}
        />
      ) : (
        <Card><p className="text-sm text-muted">No medicine set up yet. <Link className="text-accent font-semibold" href="/protocol">Add one</Link>.</p></Card>
      )}

      <Card>
        <div className="flex items-end justify-around">
          <Link href="/food" className="text-center text-xs font-semibold">
            <Ring value={waterToday} max={profile.water_target_ml} size={64} colour="var(--water)" />
            <b className="block text-base mt-1">{(waterToday / 1000).toFixed(1)} L</b><span className="text-muted">Water</span>
          </Link>
          <Link href="/food" className="text-center text-xs font-semibold">
            <Ring value={proteinToday} max={proteinTarget} size={104} stroke={11} colour="var(--protein)">
              <text x="52" y="49" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">{Math.round(proteinToday)}</text>
              <text x="52" y="66" textAnchor="middle" fontSize="11" fill="var(--muted)">of {proteinTarget} g</text>
            </Ring>
            <b className="block text-base mt-1 text-protein">Protein</b>
            <span className="text-muted">{proteinToday >= proteinTarget ? 'target hit' : `${Math.round(proteinTarget - proteinToday)} g to go`}</span>
          </Link>
          <Link href="/body" className="text-center text-xs font-semibold">
            <Ring value={(trainQ.data ?? []).filter(t => new Date(t.logged_at) >= addDays(now, -7)).length} max={2} size={64} colour="var(--steps)" />
            <b className="block text-base mt-1">{(trainQ.data ?? []).filter(t => new Date(t.logged_at) >= addDays(now, -7)).length}/2</b><span className="text-muted">Lifts</span>
          </Link>
        </div>
      </Card>

      <Link href="/sleep" className="block">
        <Card className="flex items-center gap-3 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-sleep" />
          <div className="flex-1 text-sm">
            {lastSleep?.duration_min ? (
              <><b>{Math.floor(lastSleep.duration_min / 60)}h {lastSleep.duration_min % 60}m</b>{lastSleep.hrv_ms ? <> · HRV {lastSleep.hrv_ms}</> : null}<div className="text-muted">Last night</div></>
            ) : (
              <><b>Log last night</b><div className="text-muted">Sleep drives hunger and recovery</div></>
            )}
          </div>
          <span className="text-muted">›</span>
        </Card>
      </Link>

      {moment && <MomentCard moment={moment} />}

      <InsightCard initial={insightQ.data?.body ?? null} />

      <QuickLog userId={uid} lastWeightKg={latestWeight || null} />
    </div>
  )
}
