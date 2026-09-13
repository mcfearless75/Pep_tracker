'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Card, Label } from '@/components/ui/Card'

export function InsightCard({ initial }: { initial: string | null }) {
  const [body, setBody] = useState<string | null>(initial)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function generate(refresh = false) {
    setBusy(true); setErr(null)
    try {
      const res = await fetch(`/api/ai/weekly-insight${refresh ? '?refresh=1' : ''}`, { method: 'POST' })
      const data = await res.json()
      if (data.error) setErr(data.error); else setBody(data.body)
    } catch { setErr('Network error. Try again.') } finally { setBusy(false) }
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <Label>This week</Label>
        {body && <button type="button" onClick={() => generate(true)} disabled={busy} className="text-xs font-semibold text-accent">Refresh</button>}
      </div>
      {body ? (
        <div className="mt-1.5 space-y-1.5 text-sm leading-relaxed">
          {body.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mt-1">A plain-English read of your last seven days: three findings and one action.</p>
          <button type="button" onClick={() => generate()} disabled={busy} className="mt-2 rounded-chip bg-accent text-accent-ink px-4 py-2 text-sm font-bold flex items-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {busy ? 'Reading your week…' : 'Summarise my week'}
          </button>
        </>
      )}
      {err && <p className="text-xs text-bad mt-2">{err}</p>}
    </Card>
  )
}
