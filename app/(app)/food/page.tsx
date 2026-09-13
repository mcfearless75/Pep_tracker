import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { MealPhotoUpload } from '@/components/nutrition/MealPhotoUpload'
import { FoodSearch } from '@/components/nutrition/FoodSearch'
import { WaterButtons } from '@/components/nutrition/WaterButtons'
import { MealList } from '@/components/nutrition/MealList'
import { proteinTargetG } from '@/lib/nutrition/targets'
import { isoDate, addDays } from '@/lib/dates'
import type { Meal, Profile, WaterLog, WeightLog } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function FoodPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id
  const today = isoDate()
  const [profileQ, mealsQ, waterQ, weightQ, yesterdayQ] = await Promise.all([
    supabase.from('profiles').select('protein_target_g, protein_g_per_kg, water_target_ml, start_weight_kg').eq('id', uid).maybeSingle<Pick<Profile, 'protein_target_g' | 'protein_g_per_kg' | 'water_target_ml' | 'start_weight_kg'>>(),
    supabase.from('meals').select('*').eq('user_id', uid).eq('logged_date', today).order('logged_at').returns<Meal[]>(),
    supabase.from('water_logs').select('id, logged_at, ml').eq('user_id', uid).gte('logged_at', today).returns<WaterLog[]>(),
    supabase.from('weight_logs').select('weight_kg').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1).maybeSingle<Pick<WeightLog, 'weight_kg'>>(),
    supabase.from('meals').select('*').eq('user_id', uid).eq('logged_date', isoDate(addDays(new Date(), -1))).order('logged_at').returns<Meal[]>(),
  ])
  const profile = profileQ.data!
  const meals = mealsQ.data ?? []
  const target = profile.protein_target_g ?? proteinTargetG(Number(weightQ.data?.weight_kg ?? profile.start_weight_kg ?? 0), profile.protein_g_per_kg)
  const protein = meals.reduce((s, m) => s + Number(m.protein_g), 0)
  const kcal = meals.reduce((s, m) => s + m.calories, 0)
  const fibre = meals.reduce((s, m) => s + Number(m.fibre_g ?? 0), 0)
  const water = (waterQ.data ?? []).reduce((s, w) => s + w.ml, 0)

  return (
    <div className="space-y-3">
      <header>
        <Label>Food · today</Label>
        <h1 className="text-2xl font-extrabold tracking-tight">Protein first</h1>
      </header>

      <Card>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-extrabold text-protein leading-none">{Math.round(protein)}</p>
          <p className="text-sm text-muted pb-0.5">of {target} g protein{protein >= target ? ' · hit' : ` · ${Math.round(target - protein)} g to go`}</p>
        </div>
        <div className="h-2.5 rounded-full bg-line overflow-hidden mt-2"><div className="h-full bg-protein" style={{ width: `${Math.min(100, (protein / target) * 100)}%` }} /></div>
        <div className="flex gap-4 mt-3 text-xs text-muted">
          <span><b className="text-ink">{kcal}</b> kcal</span>
          <span><b className="text-ink">{Math.round(fibre)}</b> g fibre</span>
          <span><b className="text-ink">{(water / 1000).toFixed(1)}</b> / {(profile.water_target_ml / 1000).toFixed(1)} L water</span>
        </div>
        <WaterButtons userId={uid} />
      </Card>

      <MealPhotoUpload userId={uid} />
      <FoodSearch userId={uid} />
      <MealList meals={meals} userId={uid} yesterday={yesterdayQ.data ?? []} />
    </div>
  )
}
