'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanBarcode, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { BarcodeScanner } from './BarcodeScanner'
import { parseFoodItem, type FoodItem } from '@/lib/openFoodFacts'
import { isoDate } from '@/lib/dates'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

function defaultMealType(): MealType {
  const h = new Date().getHours()
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 20 ? 'dinner' : 'snack'
}

export function FoodSearch({ userId }: { userId: string }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [picked, setPicked] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('100')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim().length < 2) return
    setBusy(true)
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(q.trim())}`)
    const products = await res.json()
    setResults(products.map((p: Parameters<typeof parseFoodItem>[0]) => parseFoodItem(p, 100)))
    setBusy(false)
  }

  async function log() {
    if (!picked) return
    const g = parseFloat(grams) || 100
    const f = g / 100
    setBusy(true)
    const supabase = createClient()
    await supabase.from('meals').insert({
      user_id: userId, logged_date: isoDate(), meal_type: defaultMealType(), food_name: picked.food_name,
      calories: Math.round(picked.calories * f), protein_g: +(picked.protein_g * f).toFixed(1), carbs_g: +(picked.carbs_g * f).toFixed(1),
      fat_g: +(picked.fat_g * f).toFixed(1), fibre_g: picked.fibre_g == null ? null : +(picked.fibre_g * f).toFixed(1),
      source: picked.barcode ? 'barcode' : 'search',
    })
    setBusy(false); setPicked(null); setResults([]); setQ('')
    router.refresh()
  }

  return (
    <Card className="space-y-2">
      <form onSubmit={search} className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search food or brand" aria-label="Search food"
          className="flex-1 rounded-chip border border-line bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
        <button type="submit" className="rounded-chip border border-line px-3" aria-label="Search"><Search size={16} /></button>
        <button type="button" onClick={() => setScanning(true)} className="rounded-chip border border-line px-3" aria-label="Scan barcode"><ScanBarcode size={16} /></button>
      </form>

      {results.length > 0 && !picked && (
        <ul className="divide-y divide-line">
          {results.map((r, i) => (
            <li key={`${r.barcode ?? r.food_name}-${i}`}>
              <button type="button" onClick={() => setPicked(r)} className="w-full text-left py-2 text-sm flex justify-between gap-2">
                <span className="truncate">{r.food_name}</span>
                <span className="text-muted shrink-0">{r.protein_g} g P · {r.calories} kcal /100 g</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked && (
        <div className="flex gap-2 items-center">
          <p className="flex-1 text-sm font-semibold truncate">{picked.food_name}</p>
          <input inputMode="decimal" value={grams} onChange={e => setGrams(e.target.value)} aria-label="Grams" className="w-16 rounded-chip border border-line bg-bg px-2 py-2 text-sm" />
          <span className="text-xs text-muted">g</span>
          <button type="button" onClick={log} disabled={busy} className="rounded-chip bg-accent text-accent-ink px-3 py-2 text-sm font-bold">Log</button>
        </div>
      )}

      {scanning && <BarcodeScanner onResult={item => { setPicked(item); setScanning(false) }} onClose={() => setScanning(false)} />}
    </Card>
  )
}
