'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function WaterButtons({ userId }: { userId: string }) {
  const router = useRouter()
  async function add(ml: number) {
    const supabase = createClient()
    await supabase.from('water_logs').insert({ user_id: userId, ml })
    router.refresh()
  }
  return (
    <div className="flex gap-1.5 mt-3">
      {[250, 500, 750].map(ml => (
        <button key={ml} type="button" onClick={() => add(ml)} className="flex-1 rounded-chip border border-line bg-bg py-1.5 text-xs font-semibold text-water">+{ml} ml</button>
      ))}
    </div>
  )
}
