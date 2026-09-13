import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropic, MODELS, extractText } from '@/lib/ai'
import { summariseWeek, INSIGHT_SYSTEM, type WeekData } from '@/lib/insights/build'
import { isoDate, addDays } from '@/lib/dates'
import { weekOnProtocol, nextDue } from '@/lib/protocol/schedule'
import { proteinTargetG } from '@/lib/nutrition/targets'

export const dynamic = 'force-dynamic'

function mondayOf(d: Date): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return isoDate(x)
}

/** One insight per user per week, cached. POST with ?refresh=1 to regenerate. */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const uid = user.id
  const now = new Date()
  const weekStart = mondayOf(now)
  const refresh = new URL(request.url).searchParams.get('refresh') === '1'

  if (!refresh) {
    const { data: cached } = await supabase.from('insights').select('body, created_at').eq('user_id', uid).eq('week_start', weekStart).maybeSingle()
    if (cached) return NextResponse.json({ body: cached.body, cached: true })
  }

  const since = addDays(now, -7).toISOString()
  const sinceDate = isoDate(addDays(now, -7))
  const [profile, meds, doses, weights, meals, water, se, training, sleep] = await Promise.all([
    supabase.from('profiles').select('display_name, protein_target_g, protein_g_per_kg, water_target_ml, start_weight_kg').eq('id', uid).maybeSingle(),
    supabase.from('medications').select('id, name, dose_mg, start_date, interval_days').eq('user_id', uid).eq('active', true).order('created_at').limit(1),
    supabase.from('doses').select('taken_at, site').eq('user_id', uid).order('taken_at', { ascending: false }).limit(10),
    supabase.from('weight_logs').select('logged_at, weight_kg').eq('user_id', uid).gte('logged_at', since).order('logged_at'),
    supabase.from('meals').select('logged_date, protein_g').eq('user_id', uid).gte('logged_date', sinceDate),
    supabase.from('water_logs').select('logged_at, ml').eq('user_id', uid).gte('logged_at', since),
    supabase.from('side_effect_logs').select('logged_at, kind, severity').eq('user_id', uid).gte('logged_at', since),
    supabase.from('training_logs').select('logged_at, kind').eq('user_id', uid).gte('logged_at', since),
    supabase.from('sleep_logs').select('night_of, duration_min, hrv_ms').eq('user_id', uid).gte('night_of', sinceDate),
  ])

  const med = meds.data?.[0]
  const allDoses = doses.data ?? []
  const lastDose = allDoses[0]
  const missed = !!(med && lastDose && nextDue(med, lastDose).getTime() < now.getTime() - 86_400_000)
  const byDay = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number) => {
    const m: Record<string, number> = {}
    rows.forEach(r => { m[key(r)] = (m[key(r)] ?? 0) + val(r) })
    return Object.entries(m).map(([date, v]) => ({ date, v })).sort((a, b) => a.date.localeCompare(b.date))
  }
  const latestWeight = weights.data?.[weights.data.length - 1]?.weight_kg ?? profile.data?.start_weight_kg ?? 0

  const data: WeekData = {
    weekStart,
    name: profile.data?.display_name ?? null,
    medication: med ? { name: med.name, dose_mg: Number(med.dose_mg), week: weekOnProtocol(med.start_date, now) } : null,
    shots: allDoses.filter(d => d.taken_at >= since),
    missedDose: missed,
    weights: (weights.data ?? []).map(w => ({ logged_at: w.logged_at, weight_kg: Number(w.weight_kg) })),
    proteinByDay: byDay(meals.data ?? [], m => m.logged_date, m => Number(m.protein_g)).map(x => ({ date: x.date, protein_g: x.v })),
    proteinTargetG: profile.data?.protein_target_g ?? proteinTargetG(Number(latestWeight), Number(profile.data?.protein_g_per_kg ?? 1.4)),
    waterByDay: byDay(water.data ?? [], w => w.logged_at.slice(0, 10), w => w.ml).map(x => ({ date: x.date, ml: x.v })),
    waterTargetMl: profile.data?.water_target_ml ?? 2000,
    sideEffects: se.data ?? [],
    training: training.data ?? [],
    sleep: (sleep.data ?? []).map(n => ({ night_of: n.night_of, duration_min: n.duration_min, hrv_ms: n.hrv_ms == null ? null : Number(n.hrv_ms) })),
  }

  try {
    const response = await getAnthropic().messages.create({
      model: MODELS.sonnet,
      max_tokens: 300,
      system: [{ type: 'text', text: INSIGHT_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: summariseWeek(data) }],
    })
    const body = extractText(response)
    await supabase.from('insights').upsert({ user_id: uid, week_start: weekStart, body, model: MODELS.sonnet }, { onConflict: 'user_id,week_start' })
    return NextResponse.json({ body, cached: false })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Could not generate the summary' }, { status: 502 })
  }
}
