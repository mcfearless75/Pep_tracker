'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Syringe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { SITES, siteLabel } from '@/lib/protocol/sites'
import { presetForName } from '@/lib/protocol/medications'
import type { Medication, InjectionSite } from '@/lib/supabase/types'
import type { DueState } from '@/lib/protocol/schedule'
import { formatDayShort } from '@/lib/dates'

type Props = {
  med: Medication
  due: string
  state: DueState
  daysUntil: number
  week: number
  suggestedSite: InjectionSite
  lastSite: InjectionSite | null
}

export function ShotCard({ med, due, state, daysUntil, week, suggestedSite, lastSite }: Props) {
  const router = useRouter()
  const [site, setSite] = useState<InjectionSite>(suggestedSite)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(state === 'taken_today')
  const preset = presetForName(med.name)

  async function logShot() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('doses').insert({
      user_id: med.user_id, medication_id: med.id, dose_mg: med.dose_mg, site, taken_at: new Date().toISOString(),
    })
    setBusy(false)
    if (!error) { setDone(true); router.refresh() }
  }

  const dueText =
    done ? 'Taken today' :
    state === 'due_today' ? 'Due today' :
    state === 'overdue' ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} late` :
    `${formatDayShort(due)} · ${daysUntil} day${daysUntil === 1 ? '' : 's'}`

  return (
    <Card className={state === 'overdue' && !done ? 'border-warn' : ''}>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>Next shot · {dueText}</Label>
          <p className="text-lg font-extrabold mt-0.5">{med.name} {Number(med.dose_mg)} mg</p>
          <p className="text-sm text-muted">Week {week}{med.licensed ? '' : ' · unlicensed compound'}{lastSite ? ` · last: ${siteLabel(lastSite)}` : ''}</p>
        </div>
        <Syringe className="text-accent" size={22} />
      </div>

      {!done && (
        <>
          <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SITES.map(s => (
              <button key={s.key} type="button" onClick={() => setSite(s.key)}
                className={`shrink-0 rounded-chip px-3 py-1.5 text-xs font-semibold border ${site === s.key ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line'}`}>
                {s.short}{s.key === suggestedSite ? ' ✓' : ''}
              </button>
            ))}
          </div>
          <button onClick={logShot} disabled={busy} className="mt-3 w-full rounded-chip bg-accent text-accent-ink font-bold py-3 disabled:opacity-60">
            {busy ? 'Logging…' : `Log shot · ${siteLabel(site)}`}
          </button>
        </>
      )}

      {done && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-good"><Check size={16} /> Logged. Next one in {med.interval_days} days.</p>
      )}

      {state === 'overdue' && !done && preset && (
        <p className="mt-3 text-xs text-muted"><b className="text-ink">Missed-dose guidance ({preset.source}):</b> {preset.missedDose}</p>
      )}
    </Card>
  )
}
