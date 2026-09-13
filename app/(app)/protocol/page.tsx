import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { Calculator } from '@/components/protocol/Calculator'
import { AddStep } from '@/components/protocol/AddStep'
import { presetForName } from '@/lib/protocol/medications'
import { levelFraction } from '@/lib/protocol/drugLevel'
import { siteLabel } from '@/lib/protocol/sites'
import { weekOnProtocol } from '@/lib/protocol/schedule'
import { formatDayShort } from '@/lib/dates'
import type { Medication, Dose, TitrationStep } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function ProtocolPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const [medsQ, dosesQ, stepsQ] = await Promise.all([
    supabase.from('medications').select('*').eq('user_id', uid).eq('active', true).order('created_at').returns<Medication[]>(),
    supabase.from('doses').select('id, medication_id, taken_at, dose_mg, site, notes').eq('user_id', uid).order('taken_at', { ascending: false }).limit(100).returns<Dose[]>(),
    supabase.from('titration_steps').select('id, medication_id, dose_mg, start_date').eq('user_id', uid).order('start_date').returns<TitrationStep[]>(),
  ])
  const meds = medsQ.data ?? []
  const doses = dosesQ.data ?? []
  const steps = stepsQ.data ?? []

  return (
    <div className="space-y-3">
      <header>
        <Label>Protocol</Label>
        <h1 className="text-2xl font-extrabold tracking-tight">My stack</h1>
      </header>

      {meds.map(med => {
        const preset = presetForName(med.name)
        const mine = doses.filter(d => d.medication_id === med.id)
        const level = med.half_life_hours
          ? levelFraction(mine.map(d => ({ taken_at: d.taken_at, dose_mg: Number(d.dose_mg) })), Number(med.half_life_hours), Number(med.dose_mg), med.interval_days * 24)
          : null
        const mySteps = steps.filter(s => s.medication_id === med.id)
        return (
          <Card key={med.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-extrabold">{med.name}</p>
                <p className="text-sm text-muted">{med.generic ?? ''}{med.generic ? ' · ' : ''}{Number(med.dose_mg)} mg · {med.frequency === 'daily' ? 'daily' : `every ${med.interval_days} days`} · week {weekOnProtocol(med.start_date)}</p>
              </div>
              {!med.licensed && <span className="rounded-chip bg-warn/15 text-warn text-[10px] font-bold px-2 py-1">UNLICENSED</span>}
            </div>

            {level != null && mine.length > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted">Estimated level vs steady state</span><b>{Math.round(level * 100)}%</b></div>
                <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent" style={{ width: `${Math.min(100, level * 100)}%` }} /></div>
                <p className="text-[11px] text-muted mt-1">Estimate from half-life ({Number(med.half_life_hours)} h), for spotting patterns only.</p>
              </div>
            )}

            {preset && preset.ladderMg.length > 0 && (
              <div>
                <Label>Manufacturer ladder · {preset.source}</Label>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {preset.ladderMg.map(mg => (
                    <span key={mg} className={`rounded-chip px-2.5 py-1 text-xs font-semibold border ${Number(med.dose_mg) === mg ? 'bg-accent text-accent-ink border-accent' : 'border-line'}`}>{mg} mg</span>
                  ))}
                </div>
                <p className="text-[11px] text-muted mt-1">Steps are usually held about {preset.stepWeeks} week{preset.stepWeeks === 1 ? '' : 's'}. Your prescriber decides when to move.</p>
              </div>
            )}

            <div>
              <Label>Titration history</Label>
              <ul className="mt-1.5 text-sm space-y-1">
                <li className="flex justify-between"><span>Started {Number(med.dose_mg)} mg</span><span className="text-muted">{formatDayShort(med.start_date)}</span></li>
                {mySteps.map(s => (
                  <li key={s.id} className="flex justify-between"><span>Stepped to {Number(s.dose_mg)} mg</span><span className="text-muted">{formatDayShort(s.start_date)}</span></li>
                ))}
              </ul>
              <AddStep med={med} />
            </div>

            <div>
              <Label>Recent shots</Label>
              {mine.length === 0 ? <p className="text-sm text-muted mt-1">None logged yet.</p> : (
                <ul className="mt-1.5 text-sm space-y-1">
                  {mine.slice(0, 6).map(d => (
                    <li key={d.id} className="flex justify-between"><span>{Number(d.dose_mg)} mg · {siteLabel(d.site)}</span><span className="text-muted">{formatDayShort(d.taken_at)}</span></li>
                  ))}
                </ul>
              )}
            </div>

            {preset && (
              <p className="text-xs text-muted"><b className="text-ink">Missed dose ({preset.source}):</b> {preset.missedDose}</p>
            )}
          </Card>
        )
      })}

      <Calculator />
    </div>
  )
}
