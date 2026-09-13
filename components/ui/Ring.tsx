type Props = {
  value: number
  max: number
  size?: number
  stroke?: number
  colour: string
  track?: string
  label?: string
  sub?: string
  children?: React.ReactNode
}

/** Progress ring. value/max clamps at 1 for the arc; the numbers can overshoot. */
export function Ring({ value, max, size = 64, stroke = 8, colour, track = 'var(--line)', children }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = max > 0 ? Math.min(1, value / max) : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(frac * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .6s ease-out' }}
      />
      {children}
    </svg>
  )
}
