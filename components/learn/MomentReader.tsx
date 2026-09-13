'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import type { Moment } from '@/lib/moments/types'

export function MomentReader({ userId, moment, alreadyRead, guideTitle }: { userId: string; moment: Moment; alreadyRead: boolean; guideTitle?: string }) {
  const router = useRouter()
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(alreadyRead)
  const [busy, setBusy] = useState(false)
  const check = moment.check

  async function finish() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('moment_reads').upsert({ user_id: userId, moment_id: moment.id, read_at: new Date().toISOString(), correct: check ? picked === check.correct : null }, { onConflict: 'user_id,moment_id' })
    setBusy(false)
    setDone(true)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {check && (
        <Card>
          <p className="font-bold text-sm">Quick check</p>
          <p className="text-sm text-muted mt-0.5">{check.question}</p>
          <div className="mt-2 space-y-1.5">
            {check.options.map((o, i) => {
              const state = picked == null ? '' : i === check.correct ? 'border-accent bg-accent/10' : i === picked ? 'border-bad' : ''
              return (
                <button key={o} type="button" disabled={picked != null} onClick={() => setPicked(i)} className={`w-full text-left rounded-chip border border-line px-3 py-2 text-sm ${state}`}>{o}{picked != null && i === check.correct ? ' ✓' : ''}</button>
              )
            })}
          </div>
          {picked != null && <p className="text-xs text-muted mt-2">{check.explain}</p>}
        </Card>
      )}
      {done ? (
        <div className="rounded-chip bg-good/10 text-good text-sm font-semibold px-3 py-2.5">Read. {guideTitle && moment.guideId ? <>Full guide: <Link href={`/learn/${moment.guideId}`} className="underline">{guideTitle}</Link></> : null}</div>
      ) : (
        <button type="button" onClick={finish} disabled={busy || (!!check && picked == null)} className="w-full rounded-chip bg-accent text-accent-ink font-bold py-3 disabled:opacity-50">
          {check && picked == null ? 'Answer the check to finish' : guideTitle ? `Done · unlock ${guideTitle}` : 'Done'}
        </button>
      )}
    </div>
  )
}
