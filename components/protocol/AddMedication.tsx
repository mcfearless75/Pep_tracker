'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { MEDICATIONS } from '@/lib/protocol/medications'
import { isoDate } from '@/lib/dates'

export function AddMedication({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('mounjaro')
  const [custom, setCustom] = useState('')
  const [dose, setDose] = useState('2.5')
  const [start, setStart] = useState(isoDate())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const preset = MEDICATIONS.find(m => m.key === key)!
  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const mg = parseFloat(dose)
    if (!(mg > 0)) { setErr('Enter a dose.'); return }
    setBusy(true); setErr(null)
    const { error } = await createClient().from('medications').insert({
      user_id: userId, name: key === 'other' ? (custom.trim() || 'Other') : preset.name, generic: preset.generic || null, form: preset.form,
      dose_mg: mg, frequency: preset.frequency, interval_days: preset.frequency === 'daily' ? 1 : 7, start_date: start,
      half_life_hours: preset.halfLifeHours, licensed: preset.licensed,
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setOpen(false); router.refresh()
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="w-full rounded-chip border border-line py-2.5 text-sm font-semibold">Add a medicine or compound</button>

  return (
    <Card>
      <Label>Add to stack</Label>
      <form onSubmit={save} className="mt-2 space-y-2">
        <select className={field} value={key} onChange={e => { setKey(e.target.value); const p = MEDICATIONS.find(m => m.key === e.target.value); if (p?.ladderMg[0]) setDose(String(p.ladderMg[0])) }} aria-label="Medicine">
          {MEDICATIONS.map(m => <option key={m.key} value={m.key}>{m.name}{!m.licensed && m.key !== 'other' ? ' — unlicensed' : ''}</option>)}
        </select>
        {key === 'other' && <input className={field} value={custom} onChange={e => setCustom(e.target.value)} placeholder="Compound name" aria-label="Compound name" />}
        {!preset.licensed && <p className="text-xs text-warn">Unlicensed. Tracked logs it and shows the calculator working; it will not suggest a dose or schedule.</p>}
        <div className="grid grid-cols-2 gap-2">
          <input className={field} inputMode="decimal" value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (mg)" aria-label="Dose in mg" />
          <input type="date" className={field} value={start} onChange={e => setStart(e.target.value)} aria-label="Start date" />
        </div>
        {err && <p className="text-xs text-bad">{err}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setOpen(false)} className="rounded-chip border border-line py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-chip bg-accent text-accent-ink py-2 text-sm font-bold">Add</button>
        </div>
      </form>
    </Card>
  )
}
