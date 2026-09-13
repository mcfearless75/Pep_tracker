import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { WeightChart } from '@/components/body/WeightChart'
import { BodyLog } from '@/components/body/BodyLog'
import { weightEma } from '@/lib/nutrition/targets'
import { formatWeight, formatLength } from '@/lib/units'
import { addDays, formatDayShort } from '@/lib/dates'
import type { Profile, WeightLog, TrainingLog } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function BodyPage({ searchParams }: { searchParams: { range?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const days = searchParams.range === '7' ? 7 : searchParams.range === '90' ? 90 : 30
  const [profileQ, weightsQ, trainQ] = await Promise.all([
    supabase.from('profiles').select('units, start_weight_kg, goal').eq('id', uid).maybeSingle<Pick<Profile, 'units' | 'start_weight_kg' | 'goal'>>(),
    supabase.from('weight_logs').select('id, logged_at, weight_kg, waist_cm').eq('user_id', uid).gte('logged_at', addDays(new Date(), -days).toISOString()).order('logged_at').returns<WeightLog[]>(),
    supabase.from('training_logs').select('id, logged_at, kind, minutes, felt').eq('user_id', uid).gte('logged_at', addDays(new Date(), -28).toISOString()).order('logged_at', { ascending: false }).returns<TrainingLog[]>(),
  ])
  const units = profileQ.data?.units ?? 'metric'
  const weights = (weightsQ.data ?? []).map(w => ({ ...w, weight_kg: Number(w.weight_kg) }))
  const ema = weightEma(weights)
  const latest = weights[weights.length - 1]
  const first = weights[0]
  const start = profileQ.data?.start_weight_kg ? Number(profileQ.data.start_weight_kg) : first?.weight_kg
  const lastWaist = [...weights].reverse().find(w => w.waist_cm != null)
  const lifts = (trainQ.data ?? []).filter(t => t.kind === 'resistance')
  const liftsThisWeek = lifts.filter(t => new Date(t.logged_at) >= addDays(new Date(), -7)).length

  return (
    <div className="space-y-3">
      <Link href="/today" className="text-sm text-muted">‹ Today</Link>
      <header><Label>Body</Label><h1 className="text-2xl font-extrabold tracking-tight">Lose fat, keep muscle</h1></header>

      <Card>
        <div className="flex justify-between items-end">
          <div>
            <Label>Trend weight</Label>
            <p className="text-3xl font-extrabold">{ema.length ? formatWeight(ema[ema.length - 1].ema, units) : '—'}</p>
            <p className="text-xs text-muted">{latest ? `latest reading ${formatWeight(latest.weight_kg, units)}` : 'no readings in this range'}{start && latest ? ` · ${formatWeight(Math.abs(latest.weight_kg - start), units)} ${latest.weight_kg <= start ? 'down' : 'up'} since start` : ''}</p>
          </div>
          <div className="flex gap-1">
            {[7, 30, 90].map(r => <Link key={r} href={`/body?range=${r}`} className={`rounded-chip px-2.5 py-1 text-xs font-semibold border ${days === r ? 'bg-accent text-accent-ink border-accent' : 'border-line'}`}>{r}d</Link>)}
          </div>
        </div>
        <WeightChart points={ema} raw={weights.map(w => ({ logged_at: w.logged_at, weight_kg: w.weight_kg }))} />
        <p className="text-[11px] text-muted mt-1">The line is a smoothed trend; dots are readings. Judge the line, not the dots.</p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card className="py-3"><Label>Waist</Label><p className="text-xl font-extrabold">{lastWaist?.waist_cm ? formatLength(Number(lastWaist.waist_cm), units) : '—'}</p><p className="text-xs text-muted">{lastWaist ? formatDayShort(lastWaist.logged_at) : 'log it monthly'}</p></Card>
        <Card className="py-3"><Label>Lifts</Label><p className="text-xl font-extrabold">{liftsThisWeek}<span className="text-sm text-muted font-semibold">/2 this week</span></p><p className="text-xs text-muted">{lifts.length} in 4 weeks</p></Card>
      </div>

      <BodyLog userId={uid} units={units} />

      <Card>
        <Label>Readings</Label>
        {weights.length === 0 ? <p className="text-sm text-muted mt-1">None in this range.</p> : (
          <ul className="mt-2 divide-y divide-line text-sm">
            {[...weights].reverse().slice(0, 14).map(w => (
              <li key={w.id} className="py-1.5 flex justify-between"><span>{formatDayShort(w.logged_at)}</span><span><b>{formatWeight(w.weight_kg, units)}</b>{w.waist_cm ? <span className="text-muted"> · waist {formatLength(Number(w.waist_cm), units)}</span> : null}</span></li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
