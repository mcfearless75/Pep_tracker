import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { BloodworkEntry } from '@/components/bloodwork/BloodworkEntry'
import { MARKERS, markerByKey, rangeStatus, rangeLabel } from '@/lib/bloodwork/markers'
import { formatDayShort } from '@/lib/dates'
import type { BloodworkResult } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function BloodsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('bloodwork_results').select('*').eq('user_id', user!.id).order('taken_on', { ascending: false }).returns<BloodworkResult[]>()
  const results = data ?? []
  const groups = Array.from(new Set(MARKERS.map(m => m.group)))

  return (
    <div className="space-y-3">
      <Link href="/protocol" className="text-sm text-muted">‹ Protocol</Link>
      <header><Label>Bloodwork</Label><h1 className="text-2xl font-extrabold tracking-tight">Your markers</h1></header>

      <BloodworkEntry userId={user!.id} />

      {results.length === 0 && <p className="text-sm text-muted px-1">Nothing yet. Add results by hand or upload a lab report.</p>}

      {groups.map(group => {
        const rows = MARKERS.filter(m => m.group === group).map(m => ({ marker: m, history: results.filter(r => r.marker === m.key) })).filter(r => r.history.length > 0)
        if (rows.length === 0) return null
        return (
          <Card key={group}>
            <Label>{group}</Label>
            <ul className="mt-2 divide-y divide-line">
              {rows.map(({ marker, history }) => {
                const latest = history[0]
                const prev = history[1]
                const status = rangeStatus(marker, Number(latest.value))
                const colour = status === 'in_range' ? 'text-good' : status === 'unknown' ? 'text-muted' : 'text-warn'
                return (
                  <li key={marker.key} className="py-2.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-sm">{marker.label}</p>
                      <p className={`font-extrabold ${colour}`}>{Number(latest.value)} <span className="text-xs font-normal text-muted">{latest.unit ?? marker.unit}</span></p>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>{formatDayShort(latest.taken_on)}{prev ? ` · was ${Number(prev.value)} on ${formatDayShort(prev.taken_on)}` : ''}</span>
                      <span>{status === 'in_range' ? 'in range' : status === 'low' ? 'below' : status === 'high' ? 'above' : ''} {rangeLabel(marker)}</span>
                    </div>
                    <p className="text-xs mt-1">{marker.why}</p>
                    {status !== 'in_range' && status !== 'unknown' && <p className="text-xs text-accent mt-0.5">Ask your GP: {marker.askGp}</p>}
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      })}

      {results.some(r => !markerByKey(r.marker)) && (
        <p className="text-xs text-muted">Some saved results use markers this version does not explain yet. They are kept and exported.</p>
      )}
      <p className="text-[11px] text-muted">Reference ranges are typical UK adult guides. Your lab&apos;s range is on your report and wins. Nothing here is a diagnosis.</p>
    </div>
  )
}
