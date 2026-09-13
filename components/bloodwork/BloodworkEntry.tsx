'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { MARKERS } from '@/lib/bloodwork/markers'
import { isoDate } from '@/lib/dates'

type Extracted = { marker: string; value: number; unit: string }

export function BloodworkEntry({ userId }: { userId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [marker, setMarker] = useState(MARKERS[0].key)
  const [value, setValue] = useState('')
  const [date, setDate] = useState(isoDate())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<{ taken_on: string | null; source: 'photo' | 'pdf'; results: Extracted[] } | null>(null)

  const m = MARKERS.find(x => x.key === marker)!
  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'

  async function saveOne(e: React.FormEvent) {
    e.preventDefault()
    const v = parseFloat(value)
    if (!(v >= 0)) return
    setBusy(true)
    const { error } = await createClient().from('bloodwork_results').insert({ user_id: userId, marker, value: v, unit: m.unit, taken_on: date, source: 'manual' })
    setBusy(false)
    setMsg(error ? error.message : `${m.label} saved`)
    if (!error) { setValue(''); router.refresh() }
  }

  async function upload(file: File | null) {
    if (!file) return
    setBusy(true); setMsg(null); setExtracted(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/ai/bloodwork', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setMsg(data.error); return }
      if (!data.results?.length) { setMsg('No recognised markers found in that report. Add them by hand.'); return }
      setExtracted({ taken_on: data.taken_on, source: data.source, results: data.results })
      if (data.taken_on) setDate(data.taken_on)
    } catch { setMsg('Network error. Try again.') } finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function saveExtracted() {
    if (!extracted) return
    setBusy(true)
    const rows = extracted.results.map(r => ({ user_id: userId, marker: r.marker, value: r.value, unit: r.unit, taken_on: extracted.taken_on ?? date, source: extracted.source }))
    const { error } = await createClient().from('bloodwork_results').insert(rows)
    setBusy(false)
    setMsg(error ? error.message : `${rows.length} results saved`)
    if (!error) { setExtracted(null); router.refresh() }
  }

  return (
    <Card className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Add results</Label>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="text-xs font-semibold text-accent flex items-center gap-1">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} Upload report (photo or PDF)
        </button>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => upload(e.target.files?.[0] ?? null)} />
      </div>

      {extracted ? (
        <div className="space-y-2">
          <p className="text-sm">Found {extracted.results.length} markers{extracted.taken_on ? ` dated ${extracted.taken_on}` : ''}. Check them before saving.</p>
          <ul className="text-sm divide-y divide-line">
            {extracted.results.map((r, i) => (
              <li key={i} className="py-1.5 flex justify-between"><span>{MARKERS.find(x => x.key === r.marker)?.label ?? r.marker}</span><b>{r.value} <span className="font-normal text-muted text-xs">{r.unit}</span></b></li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setExtracted(null)} className="rounded-chip border border-line py-2 text-sm font-semibold">Discard</button>
            <button type="button" onClick={saveExtracted} disabled={busy} className="rounded-chip bg-accent text-accent-ink py-2 text-sm font-bold">Save all</button>
          </div>
        </div>
      ) : (
        <form onSubmit={saveOne} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
          <label className="text-xs font-semibold">Marker
            <select className={`${field} mt-1`} value={marker} onChange={e => setMarker(e.target.value)}>
              {MARKERS.map(x => <option key={x.key} value={x.key}>{x.label} ({x.unit})</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold">Value<input inputMode="decimal" className={`${field} mt-1 w-24`} value={value} onChange={e => setValue(e.target.value)} placeholder={m.unit} /></label>
          <label className="text-xs font-semibold">Date<input type="date" className={`${field} mt-1`} value={date} onChange={e => setDate(e.target.value)} /></label>
          <button type="submit" disabled={busy} className="col-span-3 rounded-chip bg-accent text-accent-ink font-bold py-2.5 disabled:opacity-60">Save result</button>
        </form>
      )}
      {msg && <p className="text-xs text-good" role="status">{msg}</p>}
    </Card>
  )
}
