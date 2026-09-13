import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toCsv } from '@/lib/export/csv'

export const dynamic = 'force-dynamic'

const TABLES = ['medications', 'titration_steps', 'doses', 'weight_logs', 'side_effect_logs', 'mood_logs', 'training_logs', 'meals', 'water_logs', 'sleep_logs', 'bloodwork_results', 'moment_reads', 'insights'] as const

/** GET /api/export?format=json|csv. Everything the user owns, RLS-scoped. */
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const format = new URL(request.url).searchParams.get('format') ?? 'json'

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const out: Record<string, unknown[]> = {}
  for (const t of TABLES) {
    const { data } = await supabase.from(t).select('*').eq('user_id', user.id)
    out[t] = (data ?? []).map(r => { const { user_id: _u, ...rest } = r as Record<string, unknown>; return rest })
  }
  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    const parts = Object.entries(out).map(([t, rows]) => `# ${t}\n${toCsv(rows as Record<string, unknown>[])}`)
    return new NextResponse(parts.join('\n\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="tracked-export-${stamp}.csv"` },
    })
  }
  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), profile, ...out }, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="tracked-export-${stamp}.json"` },
  })
}
