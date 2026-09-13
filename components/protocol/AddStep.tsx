'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isoDate } from '@/lib/dates'
import type { Medication } from '@/lib/supabase/types'

export function AddStep({ med }: { med: Medication }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dose, setDose] = useState('')
  const [date, setDate] = useState(isoDate())
  const [busy, setBusy] = useState(false)

  async function save() {
    const mg = parseFloat(dose)
    if (!(mg > 0)) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('titration_steps').insert({ user_id: med.user_id, medication_id: med.id, dose_mg: mg, start_date: date })
    await supabase.from('medications').update({ dose_mg: mg }).eq('id', med.id)
    setBusy(false)
    setOpen(false)
    setDose('')
    router.refresh()
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mt-2 text-xs font-semibold text-accent">Record a dose change your prescriber made</button>

  return (
    <div className="mt-2 flex gap-2 items-center">
      <input inputMode="decimal" value={dose} onChange={e => setDose(e.target.value)} placeholder="mg" aria-label="New dose in mg" className="w-20 rounded-chip border border-line bg-bg px-3 py-2 text-sm" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Date of change" className="flex-1 rounded-chip border border-line bg-bg px-3 py-2 text-sm" />
      <button type="button" onClick={save} disabled={busy} className="rounded-chip bg-accent text-accent-ink px-3 py-2 text-sm font-bold">Save</button>
    </div>
  )
}
