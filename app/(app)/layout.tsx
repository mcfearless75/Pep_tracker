import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TabBar } from '@/components/ui/TabBar'
import { NightMode } from '@/components/ui/NightMode'
import type { Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, night_mode_start, night_mode_end')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'onboarded_at' | 'night_mode_start' | 'night_mode_end'>>()

  if (!profile?.onboarded_at) redirect('/welcome')

  return (
    <>
      <NightMode start={profile.night_mode_start.slice(0, 5)} end={profile.night_mode_end.slice(0, 5)} />
      <main className="max-w-md mx-auto px-4 pb-28 pt-4 safe-top min-h-screen">{children}</main>
      <TabBar />
    </>
  )
}
