import { createClient } from '@/lib/supabase/server'
import { Card, Label } from '@/components/ui/Card'
import { SettingsForm } from './SettingsForm'
import { DataControls } from './DataControls'
import type { Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle<Profile>()
  return (
    <div className="space-y-3">
      <header><Label>Settings</Label><h1 className="text-2xl font-extrabold tracking-tight">You</h1></header>
      <SettingsForm profile={profile!} />
      <DataControls />
      <p className="text-xs text-muted px-1">Signed in as {user!.email}.</p>
    </div>
  )
}
