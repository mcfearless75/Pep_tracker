import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, Label } from '@/components/ui/Card'
import { guideById, GUIDES } from '@/lib/learn/guides'

export function generateStaticParams() {
  return GUIDES.map(g => ({ id: g.id }))
}

export default function GuidePage({ params }: { params: { id: string } }) {
  const guide = guideById(params.id)
  if (!guide) notFound()
  return (
    <article className="space-y-4">
      <Link href="/learn" className="text-sm text-muted">‹ Learn</Link>
      <header>
        <Label>{guide.shelf} · {guide.readMinutes} min</Label>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance mt-1">{guide.title}</h1>
        <p className="text-muted mt-1">{guide.summary}</p>
      </header>
      {guide.sections.map(s => (
        <section key={s.heading}>
          <h2 className="text-lg font-bold">{s.heading}</h2>
          {s.paragraphs.map((p, i) => <p key={i} className="mt-1.5 leading-relaxed">{p}</p>)}
        </section>
      ))}
      <Card className="border-accent/50">
        <Label className="text-accent">Ask your prescriber</Label>
        <p className="text-sm mt-1">{guide.prescriberPrompt}</p>
      </Card>
      <p className="text-xs text-muted">Sources: {guide.sources.join(' · ')}. Educational, not medical advice.</p>
    </article>
  )
}
