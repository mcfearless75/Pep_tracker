import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAnthropic, MODELS, extractText } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const SYSTEM = `You estimate nutrition from a photo of a meal for someone on a GLP-1 medicine who is tracking protein to protect muscle. Be realistic about UK portion sizes. Return ONLY a JSON object, no prose, no code fences:
{"food_name": "short name, e.g. 'Grilled chicken, rice and broccoli'", "meal_type": "breakfast|lunch|dinner|snack", "calories": integer kcal, "protein_g": number to 1 dp, "carbs_g": number to 1 dp, "fat_g": number to 1 dp, "fibre_g": number to 1 dp, "confidence": "low|medium|high", "notes": "one short sentence, protein-focused, e.g. 'About 35 g protein; add yoghurt to reach 45 g.'"}
If you cannot identify the food, give your best guess with confidence "low".`

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No image' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Image too large' }, { status: 413 })

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const mediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ? file.type : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

  try {
    const anthropic = getAnthropic()
    const response = await anthropic.messages.create({
      model: MODELS.haiku,
      max_tokens: 400,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Estimate this meal.' },
        ],
      }],
    }) as Anthropic.Message

    const raw = extractText(response).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    try {
      return NextResponse.json({ success: true, estimate: JSON.parse(raw) })
    } catch {
      return NextResponse.json({ error: 'Could not read that photo. Try a clearer shot.' }, { status: 502 })
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'AI request failed' }, { status: 500 })
  }
}
