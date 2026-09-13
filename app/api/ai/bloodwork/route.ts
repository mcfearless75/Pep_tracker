import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAnthropic, MODELS, extractText } from '@/lib/ai'
import { MARKERS } from '@/lib/bloodwork/markers'

export const dynamic = 'force-dynamic'

const SYSTEM = `You extract blood test results from a photo or PDF of a UK lab report. Return ONLY a JSON object, no prose, no code fences:
{"taken_on": "YYYY-MM-DD or null", "results": [{"marker": "<key>", "value": number, "unit": "as printed"}]}
Use only these marker keys, matching by name and unit (convert nothing; if the unit differs from the one listed, still include it with the unit as printed): ${MARKERS.map(m => `${m.key} = ${m.label} (${m.unit})`).join('; ')}.
Skip anything not in that list. If nothing matches, return {"taken_on": null, "results": []}.`

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 413 })

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const isPdf = file.type === 'application/pdf'
  const mediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ? file.type : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

  const block: Anthropic.ContentBlockParam = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }

  try {
    const response = await getAnthropic().messages.create({
      model: MODELS.haiku,
      max_tokens: 800,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: [block, { type: 'text', text: 'Extract the results.' }] }],
    }) as Anthropic.Message
    const raw = extractText(response).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(raw) as { taken_on: string | null; results: { marker: string; value: number; unit: string }[] }
    const known = new Set(MARKERS.map(m => m.key))
    parsed.results = (parsed.results ?? []).filter(r => known.has(r.marker) && typeof r.value === 'number')
    return NextResponse.json({ success: true, source: isPdf ? 'pdf' : 'photo', ...parsed })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Could not read that report' }, { status: 502 })
  }
}
