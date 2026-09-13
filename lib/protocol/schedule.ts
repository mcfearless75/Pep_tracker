import type { Medication, Dose } from '@/lib/supabase/types'
import { DAY_MS } from '@/lib/dates'

/** Next due time given the last dose and the medication's interval. */
export function nextDue(med: Pick<Medication, 'interval_days' | 'start_date'>, lastDose?: Pick<Dose, 'taken_at'>): Date {
  if (lastDose) return new Date(new Date(lastDose.taken_at).getTime() + med.interval_days * DAY_MS)
  return new Date(med.start_date + 'T09:00:00')
}

export type DueState = 'due_today' | 'overdue' | 'upcoming' | 'taken_today'

export function dueState(next: Date, lastDose: Pick<Dose, 'taken_at'> | undefined, now: Date = new Date()): DueState {
  const today = now.toDateString()
  if (lastDose && new Date(lastDose.taken_at).toDateString() === today) return 'taken_today'
  if (next.toDateString() === today) return 'due_today'
  if (next.getTime() < now.getTime()) return 'overdue'
  return 'upcoming'
}

export function daysUntil(next: Date, now: Date = new Date()): number {
  const a = new Date(now); a.setHours(0, 0, 0, 0)
  const b = new Date(next); b.setHours(0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / DAY_MS)
}

/** Week number on protocol, 1-based, from the medication start date. */
export function weekOnProtocol(startDate: string, now: Date = new Date()): number {
  const days = Math.floor((now.getTime() - new Date(startDate).getTime()) / DAY_MS)
  return Math.max(1, Math.floor(days / 7) + 1)
}
