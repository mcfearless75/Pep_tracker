import Link from 'next/link'
import type { Moment } from '@/lib/moments/types'

export function MomentCard({ moment }: { moment: Moment }) {
  return (
    <Link href={`/learn/moment/${moment.id}`} className="block rounded-card p-4 text-accent-ink" style={{ background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 75%, black))' }}>
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase opacity-80">Today&apos;s moment · {moment.readSeconds} sec</p>
      <p className="text-base font-extrabold mt-1">{moment.title}</p>
      <p className="text-sm opacity-90 mt-0.5">{moment.hook}</p>
    </Link>
  )
}
