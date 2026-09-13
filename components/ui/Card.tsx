import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-card bg-surface border border-line p-4', className)}>{children}</div>
}

export function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-[11px] font-bold tracking-[0.1em] uppercase text-muted', className)}>{children}</p>
}
