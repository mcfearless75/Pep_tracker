'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, Label } from '@/components/ui/Card'

type M = { id: string; title: string; hook: string; readSeconds: number; tag: string; read: boolean }
type G = { id: string; title: string; summary: string; shelf: string; readMinutes: number }

export function LearnSearch({ moments, guides }: { moments: M[]; guides: G[] }) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const ms = useMemo(() => moments.filter(m => !needle || `${m.title} ${m.hook} ${m.tag}`.toLowerCase().includes(needle)), [moments, needle])
  const gs = useMemo(() => guides.filter(g => !needle || `${g.title} ${g.summary} ${g.shelf}`.toLowerCase().includes(needle)), [guides, needle])
  const shelves = Array.from(new Set(gs.map(g => g.shelf)))

  return (
    <>
      <input id="learn-search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search guides and moments" aria-label="Search"
        className="w-full rounded-chip border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />

      {ms.length > 0 && (
        <section>
          <Label>Moments</Label>
          <ul className="mt-2 space-y-1.5">
            {ms.map(m => (
              <li key={m.id}>
                <Link href={`/learn/moment/${m.id}`} className="flex items-center gap-3 rounded-chip bg-surface border border-line px-3 py-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${m.read ? 'bg-good' : 'bg-line'}`} />
                  <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{m.title}</span><span className="block text-xs text-muted">{m.readSeconds} sec · {m.tag.replace('_', ' ')}</span></span>
                  <span className="text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shelves.map(shelf => (
        <section key={shelf}>
          <Label>{shelf}</Label>
          <div className="mt-2 space-y-2">
            {gs.filter(g => g.shelf === shelf).map(g => (
              <Link key={g.id} href={`/learn/${g.id}`} className="block">
                <Card className="py-3"><p className="font-bold">{g.title}</p><p className="text-sm text-muted mt-0.5">{g.summary}</p><p className="text-xs text-muted mt-1">{g.readMinutes} min read</p></Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {ms.length === 0 && gs.length === 0 && <p className="text-sm text-muted text-center py-6">Nothing matches &ldquo;{q}&rdquo;.</p>}
    </>
  )
}
