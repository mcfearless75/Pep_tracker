'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { validateImageFile, compressImage } from './mealPhoto'
import { isoDate } from '@/lib/dates'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type Estimate = {
  food_name: string
  meal_type: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number
  confidence: 'low' | 'medium' | 'high'
  notes?: string
}

export function MealPhotoUpload({ userId }: { userId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    setError(null); setEstimate(null)
    const valid = validateImageFile(file)
    if (!valid.ok) { setError(valid.error); if (fileRef.current) fileRef.current.value = ''; return }
    setPreview(URL.createObjectURL(file))
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', await compressImage(file))
      const res = await fetch('/api/ai/meal-photo', { method: 'POST', body: fd })
      const data: { error?: string; estimate?: Estimate } = await res.json()
      if (data.error || !data.estimate) { setError(data.error ?? 'Could not read that photo. Try again.'); return }
      setEstimate(data.estimate)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function log() {
    if (!estimate) return
    setBusy(true)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('meals').insert({
      user_id: userId,
      logged_date: isoDate(),
      meal_type: estimate.meal_type,
      food_name: estimate.food_name,
      calories: Math.round(estimate.calories),
      protein_g: +Number(estimate.protein_g).toFixed(1),
      carbs_g: +Number(estimate.carbs_g).toFixed(1),
      fat_g: +Number(estimate.fat_g).toFixed(1),
      fibre_g: +Number(estimate.fibre_g ?? 0).toFixed(1),
      source: 'photo',
      confidence: estimate.confidence,
    })
    setBusy(false)
    if (dbErr) { setError('Could not save the meal. Try again.'); return }
    reset()
    router.refresh()
  }

  function reset() {
    setEstimate(null); setPreview(null); setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (estimate && preview) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Scan result</Label>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-chip ${estimate.confidence === 'high' ? 'bg-good/15 text-good' : estimate.confidence === 'medium' ? 'bg-warn/15 text-warn' : 'bg-bad/15 text-bad'}`}>{estimate.confidence} confidence</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Your meal" className="w-full h-40 object-cover rounded-chip" />
        <p className="font-bold">{estimate.food_name} <span className="text-muted font-normal text-sm capitalize">· {estimate.meal_type}</span></p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Macro label="protein" value={`${estimate.protein_g} g`} strong />
          <Macro label="kcal" value={String(estimate.calories)} />
          <Macro label="carbs" value={`${estimate.carbs_g} g`} />
          <Macro label="fat" value={`${estimate.fat_g} g`} />
        </div>
        {estimate.notes && <p className="text-xs text-muted">{estimate.notes}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={reset} className="rounded-chip border border-line py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"><X size={14} /> Retake</button>
          <button onClick={log} disabled={busy} className="rounded-chip bg-accent text-accent-ink py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Log it
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full rounded-chip bg-protein text-white py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
        {busy ? <><Loader2 size={16} className="animate-spin" /> Reading your plate…</> : <><Camera size={16} /> Scan a meal</>}
      </button>
      <p className="text-xs text-muted mt-2 text-center">Photo in, protein and calories out. Under ten seconds.</p>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
      {error && <p className="text-xs text-bad mt-2">{error}</p>}
    </Card>
  )
}

function Macro({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-chip border p-2 ${strong ? 'border-protein bg-protein/10' : 'border-line bg-bg'}`}>
      <p className={`text-sm font-extrabold ${strong ? 'text-protein' : ''}`}>{value}</p>
      <p className="text-[10px] uppercase text-muted font-bold">{label}</p>
    </div>
  )
}
