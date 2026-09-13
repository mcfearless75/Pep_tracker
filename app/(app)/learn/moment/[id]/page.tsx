import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { MomentReader } from '@/components/learn/MomentReader'
import { momentById } from '@/lib/moments/content'
import { guideById } from '@/lib/learn/guides'

export const dynamic = 'force-dynamic'

export default async function MomentPage({ params }: { params: { id: string } }) {
  const moment = momentById(params.id)
  if (!moment) notFound()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: read } = await supabase.from('moment_reads').select('read_at, correct').eq('user_id', user!.id).eq('moment_id', moment.id).maybeSingle()
  const guide = moment.guideId ? guideById(moment.guideId) : undefined

  return (
    <article className="space-y-4">
      <div className="flex justify-between items-center">
        <Link href="/today" className="text-sm text-muted">‹ Today</Link>
        <span className="rounded-chip border border-line text-xs font-semibold px-2.5 py-1">{moment.readSeconds} sec · {moment.tag.replace('_', ' ')}</span>
      </div>
      <header>
        <Label>Moment</Label>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance mt-1">{moment.title}</h1>
      </header>
      <div className="space-y-3 leading-relaxed">
        {moment.body.map((p, i) => {
          const m = p.match(/^\*\*(.+?):\*\*\s*(.*)$/)
          return m ? <p key={i}><b className="text-accent">{m[1]}:</b> {m[2]}</p> : <p key={i}>{p}</p>
        })}
      </div>
      {moment.prescriberPrompt && (
        <Card className="border-accent/50"><Label className="text-accent">Ask your prescriber</Label><p className="text-sm mt-1">{moment.prescriberPrompt}</p></Card>
      )}
      <MomentReader userId={user!.id} moment={moment} alreadyRead={!!read} guideTitle={guide?.title} />
      <p className="text-xs text-muted">Sources: {moment.sources.join(' · ')}. Educational, not medical advice.</p>
    </article>
  )
}
