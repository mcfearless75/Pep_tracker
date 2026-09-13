'use client'

import { useState } from 'react'
import { Card, Label } from '@/components/ui/Card'
import { calculate, type CalcResult } from '@/lib/protocol/calculator'

export function Calculator() {
  const [vial, setVial] = useState('10')
  const [water, setWater] = useState('2')
  const [dose, setDose] = useState('0.5')
  const [showWorking, setShowWorking] = useState(false)

  let result: CalcResult | null = null
  let err: string | null = null
  try {
    result = calculate({ vialMg: parseFloat(vial), waterMl: parseFloat(water), doseMg: parseFloat(dose) })
  } catch (e) {
    err = (e as Error).message
  }

  const field = 'w-full rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'

  return (
    <Card className="space-y-3">
      <div>
        <Label>Vial calculator</Label>
        <p className="text-sm text-muted mt-0.5">Enter what is on the vial and what you have been prescribed. Every step is shown so you can check it.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs font-semibold">Vial (mg)<input className={`${field} mt-1`} inputMode="decimal" value={vial} onChange={e => setVial(e.target.value)} /></label>
        <label className="text-xs font-semibold">Water (ml)<input className={`${field} mt-1`} inputMode="decimal" value={water} onChange={e => setWater(e.target.value)} /></label>
        <label className="text-xs font-semibold">Dose (mg)<input className={`${field} mt-1`} inputMode="decimal" value={dose} onChange={e => setDose(e.target.value)} /></label>
      </div>

      {err && <p className="text-sm text-bad">{err}</p>}

      {result && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-chip bg-bg border border-line p-2"><p className="text-xl font-extrabold">{result.units}</p><p className="text-[10px] uppercase text-muted font-bold">units (U-100)</p></div>
            <div className="rounded-chip bg-bg border border-line p-2"><p className="text-xl font-extrabold">{result.doseMl}</p><p className="text-[10px] uppercase text-muted font-bold">ml</p></div>
            <div className="rounded-chip bg-bg border border-line p-2"><p className="text-xl font-extrabold">{result.dosesPerVial}</p><p className="text-[10px] uppercase text-muted font-bold">doses / vial</p></div>
          </div>
          {result.warnings.map(w => <p key={w} className="text-xs text-warn">{w}</p>)}
          <button type="button" onClick={() => setShowWorking(v => !v)} className="text-xs font-semibold text-accent">{showWorking ? 'Hide' : 'Show'} the working</button>
          {showWorking && (
            <ol className="text-sm space-y-1.5">
              {result.steps.map(s => (
                <li key={s.label} className="flex justify-between gap-3"><span className="text-muted">{s.label}: {s.working}</span><b className="shrink-0">{s.result}</b></li>
              ))}
            </ol>
          )}
        </>
      )}
      <p className="text-[11px] text-muted">Check the result with your prescriber or pharmacist before injecting. Tracked does the arithmetic; it does not choose the dose.</p>
    </Card>
  )
}
