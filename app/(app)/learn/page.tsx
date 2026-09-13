import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Label } from '@/components/ui/Card'
import { LearnSearch } from '@/components/learn/LearnSearch'
import { GUIDES } from '@/lib/learn/guides'
import { MOMENTS } from '@/lib/moments/content'
import type { MomentRead } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function LearnPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: reads } = await supabase.from('moment_reads').select('moment_id, read_at, correct').eq('user_id', user!.id).returns<MomentRead[]>()
  const readIds = new Set((reads ?? []).map(r => r.moment_id))

  return (
    <div className="space-y-4">
      <header><Label>Learn · {readIds.size} of {MOMENTS.length} moments read</Label><h1 className="text-2xl font-extrabold tracking-tight">Guides and moments</h1></header>

      <LearnSearch
        moments={MOMENTS.map(m => ({ id: m.id, title: m.title, hook: m.hook, readSeconds: m.readSeconds, tag: m.tag, read: readIds.has(m.id) }))}
        guides={GUIDES.map(g => ({ id: g.id, title: g.title, summary: g.summary, shelf: g.shelf, readMinutes: g.readMinutes }))}
      />
    </div>
  )
}
