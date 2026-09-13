'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm({ next, initialError }: { next?: string; initialError: string | null }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? '/today')}`
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-card bg-surface border border-line p-5">
        <p className="font-bold">Check your email</p>
        <p className="text-sm text-muted mt-1">We sent a sign-in link to {email}. Open it on this device.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="email" className="block text-sm font-semibold">Email</label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full rounded-chip border border-line bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent"
        placeholder="you@example.com"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-chip bg-accent text-accent-ink font-bold py-3 disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Send magic link'}
      </button>
      {error && <p className="text-sm text-bad">{error}</p>}
    </form>
  )
}
