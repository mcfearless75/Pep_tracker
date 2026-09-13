'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MEDICATIONS } from '@/lib/protocol/medications'
import { PROTEIN_BANDS, proteinTargetG } from '@/lib/nutrition/targets'
import { isoDate } from '@/lib/dates'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [medKey, setMedKey] = useState('mounjaro')
  const [customName, setCustomName] = useState('')
  const [doseMg, setDoseMg] = useState('2.5')
  const [shotDay, setShotDay] = useState(new Date().getDay())
  const [startDate, setStartDate] = useState(isoDate())
  const [weightKg, setWeightKg] = useState('')
  const [band, setBand] = useState(1.4)
  const [over18, setOver18] = useState(false)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preset = MEDICATIONS.find(m => m.key === medKey)!
  const weight = parseFloat(weightKg)
  const target = proteinTargetG(weight, band)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!over18 || !agree) { setError('Confirm you are over 18 and have read the note below.'); return }
    if (!(parseFloat(doseMg) > 0)) { setError('Enter your current dose.'); return }
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const medName = medKey === 'other' ? (customName.trim() || 'Other') : preset.name

    const { error: medErr } = await supabase.from('medications').insert({
      user_id: userId,
      name: medName,
      generic: preset.generic || null,
      form: preset.form,
      dose_mg: parseFloat(doseMg),
      frequency: preset.frequency,
      interval_days: preset.frequency === 'daily' ? 1 : 7,
      shot_weekday: preset.frequency === 'weekly' ? shotDay : null,
      start_date: startDate,
      half_life_hours: preset.halfLifeHours,
      licensed: preset.licensed,
    })
    if (medErr) { setError(medErr.message); setBusy(false); return }

    if (weight > 0) {
      await supabase.from('weight_logs').insert({ user_id: userId, weight_kg: weight })
    }

    const { error: profErr } = await supabase.from('profiles').update({
      display_name: name.trim() || null,
      over_18: true,
      accepted_disclaimer_at: new Date().toISOString(),
      start_weight_kg: weight > 0 ? weight : null,
      protein_g_per_kg: band,
      protein_target_g: target,
      onboarded_at: new Date().toISOString(),
    }).eq('id', userId)
    if (profErr) { setError(profErr.message); setBusy(false); return }

    router.replace('/today')
    router.refresh()
  }

  const field = 'w-full rounded-chip border border-line bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent'

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-1">First name</label>
        <input id="name" className={field} value={name} onChange={e => setName(e.target.value)} placeholder="Paul" />
      </div>

      <div>
        <label htmlFor="med" className="block text-sm font-semibold mb-1">Medicine</label>
        <select id="med" className={field} value={medKey} onChange={e => { setMedKey(e.target.value); const p = MEDICATIONS.find(m => m.key === e.target.value); if (p?.ladderMg[0]) setDoseMg(String(p.ladderMg[0])) }}>
          {MEDICATIONS.map(m => (
            <option key={m.key} value={m.key}>{m.name}{m.generic && m.key !== 'other' ? ` (${m.generic})` : ''}{!m.licensed && m.key !== 'other' ? ' — unlicensed' : ''}</option>
          ))}
        </select>
        {medKey === 'other' && (
          <input className={`${field} mt-2`} value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Compound name" />
        )}
        {!preset.licensed && (
          <p className="text-xs text-warn mt-2">Not a licensed medicine in the UK. Tracked will log doses and show calculator working, but will not suggest a dose or schedule.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dose" className="block text-sm font-semibold mb-1">Current dose (mg)</label>
          <input id="dose" className={field} inputMode="decimal" value={doseMg} onChange={e => setDoseMg(e.target.value)} />
          {preset.ladderMg.length > 0 && <p className="text-xs text-muted mt-1">Ladder: {preset.ladderMg.join(' · ')} mg</p>}
        </div>
        <div>
          <label htmlFor="start" className="block text-sm font-semibold mb-1">Started on</label>
          <input id="start" type="date" className={field} value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
      </div>

      {preset.frequency === 'weekly' && (
        <div>
          <p className="text-sm font-semibold mb-1">Shot day</p>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((d, i) => (
              <button type="button" key={d} onClick={() => setShotDay(i)}
                className={`flex-1 rounded-chip py-2 text-sm font-semibold border ${shotDay === i ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="weight" className="block text-sm font-semibold mb-1">Current weight (kg)</label>
        <input id="weight" className={field} inputMode="decimal" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="90" />
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">Protein band</p>
        <div className="grid grid-cols-3 gap-1.5">
          {PROTEIN_BANDS.map(b => (
            <button type="button" key={b.value} onClick={() => setBand(b.value)}
              className={`rounded-chip py-2 px-1 text-xs font-semibold border ${band === b.value ? 'bg-protein text-white border-protein' : 'bg-surface border-line'}`}>
              {b.label}<span className="block font-normal text-[10px] opacity-80">{b.note}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-1">Daily target: <b className="text-ink">{target} g</b>. Agree the band with your prescriber.</p>
      </div>

      <div className="space-y-2 rounded-card bg-surface border border-line p-4 text-sm">
        <label className="flex gap-3 items-start">
          <input type="checkbox" checked={over18} onChange={e => setOver18(e.target.checked)} className="mt-1" />
          <span>I am 18 or over.</span>
        </label>
        <label className="flex gap-3 items-start">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1" />
          <span>I understand Tracked is an educational companion, not medical advice. It never recommends a dose. Decisions about my medicine are made with my prescriber.</span>
        </label>
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-chip bg-accent text-accent-ink font-bold py-3 disabled:opacity-60">
        {busy ? 'Saving…' : 'Start tracking'}
      </button>
    </form>
  )
}
