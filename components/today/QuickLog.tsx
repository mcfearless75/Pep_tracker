'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import type { SideEffectKind } from '@/lib/supabase/types'

const SIDE_EFFECTS: { kind: SideEffectKind; label: string }[] = [
  { kind: 'nausea', label: 'Nausea' }, { kind: 'constipation', label: 'Constipation' }, { kind: 'fatigue', label: 'Fatigue' },
  { kind: 'sulphur_burps', label: 'Sulphur burps' }, { kind: 'diarrhoea', label: 'Diarrhoea' }, { kind: 'vomiting', label: 'Vomiting' },
  { kind: 'dizziness', label: 'Dizziness' }, { kind: 'headache', label: 'Headache' }, { kind: 'cycle_change', label: 'Cycle change' },
  { kind: 'chills', label: 'Chills' }, { kind: 'injection_site', label: 'Injection site' },
]

export function QuickLog({ userId, lastWeightKg }: { userId: string; lastWeightKg: number | null }) {
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [severity, setSeverity] = useState(1)
  const [flash, setFlash] = useState<string | null>(null)

  async function save(table: string, row: Record<string, unknown>, msg: string) {
    const supabase = createClient()
    const { error } = await supabase.from(table).insert({ user_id: userId, ...row })
    setFlash(error ? error.message : msg)
    setTimeout(() => setFlash(null), 2000)
    if (!error) router.refresh()
  }

  return (
    <Card className="space-y-3">
      <Label>Quick log</Label>

      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const w = parseFloat(weight); if (w > 0) { save('weight_logs', { weight_kg: w }, `Weight ${w} kg logged`); setWeight('') } }}>
        <input inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder={lastWeightKg ? `Weight, last ${lastWeightKg} kg` : 'Weight (kg)'}
          className="flex-1 rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" aria-label="Weight in kg" />
        <button type="submit" className="rounded-chip bg-accent text-accent-ink px-4 text-sm font-bold">Log</button>
      </form>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted">Side effect</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <button key={s} type="button" onClick={() => setSeverity(s)} className={`rounded-full w-6 h-6 text-[10px] font-bold border ${severity === s ? 'bg-warn text-white border-warn' : 'border-line'}`} aria-label={`Severity ${s}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SIDE_EFFECTS.map(s => (
            <button key={s.kind} type="button" onClick={() => save('side_effect_logs', { kind: s.kind, severity }, `${s.label} logged`)}
              className="rounded-chip border border-line bg-bg px-2.5 py-1.5 text-xs font-semibold">{s.label}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted mb-1.5">Mood · Energy</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map(v => <button key={v} type="button" onClick={() => save('mood_logs', { mood: v }, `Mood ${v}/5 logged`)} className="flex-1 rounded-chip border border-line bg-bg py-1.5 text-xs font-semibold" aria-label={`Mood ${v}`}>{['😞', '😕', '😐', '🙂', '😄'][v - 1]}</button>)}</div>
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map(v => <button key={v} type="button" onClick={() => save('mood_logs', { energy: v }, `Energy ${v}/5 logged`)} className="flex-1 rounded-chip border border-line bg-bg py-1.5 text-xs font-semibold" aria-label={`Energy ${v}`}>{v}</button>)}</div>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button type="button" onClick={() => save('training_logs', { kind: 'resistance', minutes: 30 }, 'Lift logged')} className="flex-1 rounded-chip border border-line bg-bg py-2 text-xs font-semibold">Lifted today</button>
        <button type="button" onClick={() => save('training_logs', { kind: 'walk', minutes: 30 }, 'Walk logged')} className="flex-1 rounded-chip border border-line bg-bg py-2 text-xs font-semibold">Walked</button>
        <button type="button" onClick={() => save('water_logs', { ml: 250 }, '+250 ml')} className="flex-1 rounded-chip border border-line bg-bg py-2 text-xs font-semibold">+250 ml</button>
      </div>

      {flash && <p className="text-xs font-semibold text-good" role="status">{flash}</p>}
    </Card>
  )
}
