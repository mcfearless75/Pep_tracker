'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { isoDate, addDays } from '@/lib/dates'

export function SleepLogForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [bed, setBed] = useState('23:00')
  const [wake, setWake] = useState('07:00')
  const [awake, setAwake] = useState('20')
  const [hrv, setHrv] = useState('')
  const [rhr, setRhr] = useState('')
  const [quality, setQuality] = useState(3)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const nightOf = isoDate(addDays(new Date(), -1))
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    const bedAt = new Date(`${nightOf}T${bed}:00`)
    const wakeDay = bh * 60 + bm > wh * 60 + wm ? isoDate() : nightOf
    const wakeAt = new Date(`${wakeDay}T${wake}:00`)
    const inBed = Math.round((wakeAt.getTime() - bedAt.getTime()) / 60000)
    const duration = Math.max(0, inBed - (parseInt(awake) || 0))
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('sleep_logs').upsert({
      user_id: userId, night_of: nightOf, bedtime: bedAt.toISOString(), wake_time: wakeAt.toISOString(), duration_min: duration,
      hrv_ms: hrv ? parseFloat(hrv) : null, resting_hr: rhr ? parseInt(rhr) : null, quality, source: 'manual',
    }, { onConflict: 'user_id,night_of' })
    setBusy(false)
    setMsg(error ? error.message : 'Saved')
    if (!error) router.refresh()
  }

  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'

  return (
    <Card>
      <Label>Log last night</Label>
      <form onSubmit={save} className="mt-2 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs font-semibold">Bed<input type="time" className={`${field} mt-1`} value={bed} onChange={e => setBed(e.target.value)} /></label>
          <label className="text-xs font-semibold">Wake<input type="time" className={`${field} mt-1`} value={wake} onChange={e => setWake(e.target.value)} /></label>
          <label className="text-xs font-semibold">Awake (min)<input inputMode="numeric" className={`${field} mt-1`} value={awake} onChange={e => setAwake(e.target.value)} /></label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs font-semibold">HRV (ms)<input inputMode="decimal" className={`${field} mt-1`} value={hrv} onChange={e => setHrv(e.target.value)} placeholder="optional" /></label>
          <label className="text-xs font-semibold">Resting HR<input inputMode="numeric" className={`${field} mt-1`} value={rhr} onChange={e => setRhr(e.target.value)} placeholder="optional" /></label>
          <div className="text-xs font-semibold">Felt<div className="flex gap-1 mt-1">{[1, 2, 3, 4, 5].map(q => <button key={q} type="button" onClick={() => setQuality(q)} className={`flex-1 rounded-chip py-2 border ${quality === q ? 'bg-sleep text-white border-sleep' : 'border-line'}`}>{q}</button>)}</div></div>
        </div>
        <button type="submit" disabled={busy} className="w-full rounded-chip bg-accent text-accent-ink font-bold py-2.5 disabled:opacity-60">{busy ? 'Saving…' : 'Save night'}</button>
        {msg && <p className="text-xs text-good" role="status">{msg}</p>}
      </form>
      <p className="text-[11px] text-muted mt-2">Apple Health, Health Connect, Oura and Whoop sync are on the roadmap. Manual logging works today.</p>
    </Card>
  )
}
