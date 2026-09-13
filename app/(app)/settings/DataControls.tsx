'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Label } from '@/components/ui/Card'

export function DataControls() {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function deleteAll() {
    setBusy(true); setErr(null)
    const res = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm }) })
    const data = await res.json()
    setBusy(false)
    if (data.error) { setErr(data.error); return }
    router.replace('/login')
  }

  return (
    <Card className="space-y-3">
      <Label>Your data</Label>
      <div className="grid grid-cols-3 gap-2">
        <a href="/report" className="rounded-chip border border-line py-2 text-xs font-semibold text-center">Report for prescriber</a>
        <a href="/api/export?format=json" className="rounded-chip border border-line py-2 text-xs font-semibold text-center">Export JSON</a>
        <a href="/api/export?format=csv" className="rounded-chip border border-line py-2 text-xs font-semibold text-center">Export CSV</a>
      </div>
      <div>
        <p className="text-xs text-muted">Delete everything. Type DELETE to confirm. This cannot be undone.</p>
        <div className="flex gap-2 mt-1.5">
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm" className="flex-1 rounded-chip border border-line bg-bg px-3 py-2 text-sm" />
          <button type="button" onClick={deleteAll} disabled={busy || confirm !== 'DELETE'} className="rounded-chip bg-bad text-white px-3 py-2 text-sm font-bold disabled:opacity-40">Delete all</button>
        </div>
        {err && <p className="text-xs text-bad mt-1">{err}</p>}
      </div>
    </Card>
  )
}
