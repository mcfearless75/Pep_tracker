import { nextDue, dueState, daysUntil, weekOnProtocol } from '@/lib/protocol/schedule'

describe('schedule', () => {
  const med = { interval_days: 7, start_date: '2026-09-01' }
  it('next due is interval after the last dose', () => {
    const d = nextDue(med, { taken_at: '2026-09-06T09:00:00Z' })
    expect(d.toISOString()).toBe('2026-09-13T09:00:00.000Z')
  })
  it('uses start date when no dose yet', () => {
    expect(nextDue(med).toDateString()).toBe(new Date('2026-09-01T09:00:00').toDateString())
  })
  it('classifies states', () => {
    const now = new Date('2026-09-13T12:00:00')
    expect(dueState(new Date('2026-09-13T09:00:00'), undefined, now)).toBe('due_today')
    expect(dueState(new Date('2026-09-11T09:00:00'), undefined, now)).toBe('overdue')
    expect(dueState(new Date('2026-09-15T09:00:00'), undefined, now)).toBe('upcoming')
    expect(dueState(new Date('2026-09-20T09:00:00'), { taken_at: '2026-09-13T08:00:00' }, now)).toBe('taken_today')
  })
  it('counts whole days', () => {
    expect(daysUntil(new Date('2026-09-16T01:00:00'), new Date('2026-09-13T23:00:00'))).toBe(3)
  })
  it('week on protocol is 1-based', () => {
    expect(weekOnProtocol('2026-09-01', new Date('2026-09-01T10:00:00'))).toBe(1)
    expect(weekOnProtocol('2026-09-01', new Date('2026-09-29T10:00:00'))).toBe(5)
  })
})
