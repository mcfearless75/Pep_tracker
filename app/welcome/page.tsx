import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './OnboardingForm'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('onboarded_at').eq('id', user.id).maybeSingle()
  if (profile?.onboarded_at) redirect('/today')
  return (
    <main className="max-w-md mx-auto px-5 py-8 safe-top">
      <p className="text-xs font-bold tracking-[0.12em] uppercase text-accent">Set up</p>
      <h1 className="text-2xl font-extrabold tracking-tight mt-1">Two minutes and you are tracking</h1>
      <p className="text-muted mt-1 text-sm">Everything here can be changed later in Settings.</p>
      <div className="mt-6">
        <OnboardingForm userId={user.id} />
      </div>
    </main>
  )
}
