type Pt = { logged_at: string; ema: number }
type Raw = { logged_at: string; weight_kg: number }

/** Trend line plus reading dots. One scale, labels at min and max. */
export function WeightChart({ points, raw }: { points: Pt[]; raw: Raw[] }) {
  if (points.length < 2) return <p className="text-sm text-muted mt-3">Log a few more weights and the trend appears here.</p>
  const W = 320, H = 120, padX = 34, padY = 12
  const all = [...points.map(p => p.ema), ...raw.map(r => r.weight_kg)]
  const min = Math.floor(Math.min(...all) - 0.5), max = Math.ceil(Math.max(...all) + 0.5)
  const t0 = new Date(points[0].logged_at).getTime(), t1 = new Date(points[points.length - 1].logged_at).getTime() || t0 + 1
  const x = (iso: string) => padX + ((new Date(iso).getTime() - t0) / Math.max(1, t1 - t0)) * (W - padX - 8)
  const y = (v: number) => padY + (1 - (v - min) / Math.max(0.1, max - min)) * (H - padY * 2)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.logged_at).toFixed(1)} ${y(p.ema).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" role="img" aria-label="Weight trend">
      {[min, max].map(v => (
        <g key={v}>
          <line x1={padX} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
          <text x={padX - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{v}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {raw.map((r, i) => <circle key={i} cx={x(r.logged_at)} cy={y(r.weight_kg)} r="2.5" fill="var(--muted)" opacity="0.7" />)}
      <circle cx={x(points[points.length - 1].logged_at)} cy={y(points[points.length - 1].ema)} r="4" fill="var(--accent)" />
    </svg>
  )
}
