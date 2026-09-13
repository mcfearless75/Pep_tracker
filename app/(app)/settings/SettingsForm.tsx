'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, Label } from '@/components/ui/Card'
import { PROTEIN_BANDS } from '@/lib/nutrition/targets'
import type { Profile } from '@/lib/supabase/types'

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [name, setName] = useState(profile.display_name ?? '')
  const [band, setBand] = useState(Number(profile.protein_g_per_kg))
  const [target, setTarget] = useState(String(profile.protein_target_g ?? ''))
  const [water, setWater] = useState(String(profile.water_target_ml))
  const [nightStart, setNightStart] = useState(profile.night_mode_start.slice(0, 5))
  const [nightEnd, setNightEnd] = useState(profile.night_mode_end.slice(0, 5))
  const [msg, setMsg] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      display_name: name.trim() || null, protein_g_per_kg: band, protein_target_g: parseInt(target) || null,
      water_target_ml: parseInt(water) || 2000, night_mode_start: nightStart, night_mode_end: nightEnd,
    }).eq('id', profile.id)
    setMsg(error ? error.message : 'Saved')
    if (!error) router.refresh()
  }

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'
  return (
    <form onSubmit={save} className="space-y-3">
      <Card className="space-y-3">
        <label className="block text-xs font-semibold">Name<input className={`${field} mt-1`} value={name} onChange={e => setName(e.target.value)} /></label>
        <div>
          <Label>Protein band</Label>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {PROTEIN_BANDS.map(b => <button key={b.value} type="button" onClick={() => setBand(b.value)} className={`rounded-chip py-2 text-xs font-semibold border ${band === b.value ? 'bg-protein text-white border-protein' : 'border-line'}`}>{b.label}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold">Protein target (g)<input inputMode="numeric" className={`${field} mt-1`} value={target} onChange={e => setTarget(e.target.value)} /></label>
          <label className="block text-xs font-semibold">Water target (ml)<input inputMode="numeric" className={`${field} mt-1`} value={water} onChange={e => setWater(e.target.value)} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold">Night mode from<input type="time" className={`${field} mt-1`} value={nightStart} onChange={e => setNightStart(e.target.value)} /></label>
          <label className="block text-xs font-semibold">until<input type="time" className={`${field} mt-1`} value={nightEnd} onChange={e => setNightEnd(e.target.value)} /></label>
        </div>
        <button type="submit" className="w-full rounded-chip bg-accent text-accent-ink font-bold py-2.5">Save</button>
        {msg && <p className="text-xs text-good" role="status">{msg}</p>}
      </Card>
      <button type="button" onClick={signOut} className="w-full text-sm text-muted py-2">Sign out</button>
    </form>
  )
}
