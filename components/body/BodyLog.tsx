'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { parseWeightToKg, type Units } from '@/lib/units'

export function BodyLog({ userId, units }: { userId: string; units: Units }) {
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseWeightToKg(weight, units)
    const waistRaw = parseFloat(waist)
    const waistCm = waistRaw > 0 ? (units === 'imperial' ? waistRaw * 2.54 : waistRaw) : null
    if (!kg && !waistCm) { setMsg('Enter a weight or a waist measurement.'); return }
    const supabase = createClient()
    let error
    if (kg) ({ error } = await supabase.from('weight_logs').insert({ user_id: userId, weight_kg: kg, waist_cm: waistCm }))
    else {
      const { data: last } = await supabase.from('weight_logs').select('weight_kg').eq('user_id', userId).order('logged_at', { ascending: false }).limit(1).maybeSingle()
      ;({ error } = await supabase.from('weight_logs').insert({ user_id: userId, weight_kg: last?.weight_kg ?? 0, waist_cm: waistCm }))
    }
    setMsg(error ? error.message : 'Saved')
    if (!error) { setWeight(''); setWaist(''); router.refresh() }
  }
  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'
  return (
    <Card>
      <Label>Log</Label>
      <form onSubmit={save} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label className="text-xs font-semibold">Weight ({units === 'imperial' ? 'st lb' : 'kg'})<input className={`${field} mt-1`} inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder={units === 'imperial' ? '13 st 4' : '84.6'} /></label>
        <label className="text-xs font-semibold">Waist ({units === 'imperial' ? 'in' : 'cm'})<input className={`${field} mt-1`} inputMode="decimal" value={waist} onChange={e => setWaist(e.target.value)} placeholder="optional" /></label>
        <button type="submit" className="rounded-chip bg-accent text-accent-ink px-4 py-2 text-sm font-bold">Save</button>
      </form>
      {msg && <p className="text-xs text-good mt-2" role="status">{msg}</p>}
    </Card>
  )
}
