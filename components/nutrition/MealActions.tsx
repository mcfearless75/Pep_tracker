'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isoDate } from '@/lib/dates'
import type { Meal } from '@/lib/supabase/types'

export function MealActions({ userId, deleteId, repeat }: { userId: string; deleteId?: string; repeat?: Meal[] }) {
  const router = useRouter()

  async function remove() {
    await createClient().from('meals').delete().eq('id', deleteId!).eq('user_id', userId)
    router.refresh()
  }

  async function repeatYesterday() {
    const rows = repeat!.map(({ id: _i, logged_at: _l, ...m }) => ({ ...m, user_id: userId, logged_date: isoDate(), source: 'repeat' as const }))
    await createClient().from('meals').insert(rows)
    router.refresh()
  }

  if (deleteId) return <button type="button" onClick={remove} className="text-muted p-1 -mr-1" aria-label="Remove meal"><X size={14} /></button>
  return <button type="button" onClick={repeatYesterday} className="rounded-chip border border-line px-3 py-1.5 text-xs font-semibold">Same as yesterday ({repeat!.length} items)</button>
}
