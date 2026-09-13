import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { GUIDES, SHELVES } from '@/lib/learn/guides'
import { MOMENTS } from '@/lib/moments/content'
import type { MomentRead } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function LearnPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: reads } = await supabase.from('moment_reads').select('moment_id, read_at, correct').eq('user_id', user!.id).returns<MomentRead[]>()
  const readIds = new Set((reads ?? []).map(r => r.moment_id))
  const read = MOMENTS.filter(m => readIds.has(m.id))

  return (
    <div className="space-y-4">
      <header><Label>Learn</Label><h1 className="text-2xl font-extrabold tracking-tight">Guides and moments</h1></header>

      <section>
        <Label>Your moments · {read.length} of {MOMENTS.length} read</Label>
        <ul className="mt-2 space-y-1.5">
          {MOMENTS.map(m => (
            <li key={m.id}>
              <Link href={`/learn/moment/${m.id}`} className="flex items-center gap-3 rounded-chip bg-surface border border-line px-3 py-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${readIds.has(m.id) ? 'bg-good' : 'bg-line'}`} />
                <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{m.title}</span><span className="block text-xs text-muted">{m.readSeconds} sec · {m.tag.replace('_', ' ')}</span></span>
                <span className="text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {SHELVES.map(shelf => (
        <section key={shelf}>
          <Label>{shelf}</Label>
          <div className="mt-2 space-y-2">
            {GUIDES.filter(g => g.shelf === shelf).map(g => (
              <Link key={g.id} href={`/learn/${g.id}`} className="block">
                <Card className="py-3">
                  <p className="font-bold">{g.title}</p>
                  <p className="text-sm text-muted mt-0.5">{g.summary}</p>
                  <p className="text-xs text-muted mt-1">{g.readMinutes} min read</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
