import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Deletes everything. Rows go via the profile cascade; the auth user goes via
 * the service role when SUPABASE_SERVICE_ROLE_KEY is set, otherwise the
 * account is left empty and signed out.
 */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { confirm } = await request.json().catch(() => ({ confirm: '' }))
  if (confirm !== 'DELETE') return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const admin = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false } })
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.auth.signOut()
    return NextResponse.json({ deleted: 'account' })
  }

  const { error } = await supabase.from('profiles').delete().eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.auth.signOut()
  return NextResponse.json({ deleted: 'data' })
}
