import { Card, Label } from '@/components/ui/Card'
import { MealActions } from './MealActions'
import { formatTime } from '@/lib/dates'
import type { Meal } from '@/lib/supabase/types'

const ORDER: Meal['meal_type'][] = ['breakfast', 'lunch', 'dinner', 'snack']

export function MealList({ meals, userId, yesterday }: { meals: Meal[]; userId: string; yesterday: Meal[] }) {
  if (meals.length === 0) return (
    <div className="text-center py-4 space-y-2">
      <p className="text-sm text-muted">Nothing logged yet today. Scan your first meal above.</p>
      {yesterday.length > 0 && <MealActions userId={userId} repeat={yesterday} />}
    </div>
  )
  return (
    <div className="space-y-3">
      {ORDER.filter(t => meals.some(m => m.meal_type === t)).map(t => {
        const group = meals.filter(m => m.meal_type === t)
        return (
          <Card key={t}>
            <div className="flex justify-between items-baseline">
              <Label className="capitalize">{t}</Label>
              <span className="text-xs text-muted">{group.length} item{group.length === 1 ? '' : 's'} · {group.reduce((s, m) => s + m.calories, 0)} kcal</span>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {group.map(m => (
                <li key={m.id} className="py-2 flex justify-between gap-3 text-sm">
                  <div className="min-w-0"><p className="font-semibold truncate">{m.food_name}</p><p className="text-xs text-muted">{formatTime(m.logged_at)} · {m.source}</p></div>
                  <div className="text-right shrink-0"><p className="font-extrabold text-protein">{Number(m.protein_g)} g</p><p className="text-xs text-muted">{m.calories} kcal</p></div>
                  <MealActions userId={userId} deleteId={m.id} />
                </li>
              ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
