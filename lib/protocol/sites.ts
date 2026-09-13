import type { InjectionSite } from '@/lib/supabase/types'

export const SITES: { key: InjectionSite; label: string; short: string }[] = [
  { key: 'abdomen_left', label: 'Abdomen, left', short: 'Abd L' },
  { key: 'abdomen_right', label: 'Abdomen, right', short: 'Abd R' },
  { key: 'thigh_left', label: 'Thigh, left', short: 'Thigh L' },
  { key: 'thigh_right', label: 'Thigh, right', short: 'Thigh R' },
  { key: 'arm_left', label: 'Upper arm, left', short: 'Arm L' },
  { key: 'arm_right', label: 'Upper arm, right', short: 'Arm R' },
]

export const SITE_ORDER: InjectionSite[] = [
  'abdomen_left', 'abdomen_right', 'thigh_left', 'thigh_right', 'arm_left', 'arm_right',
]

/**
 * Least-recently-used rotation. Unused sites come first in SITE_ORDER; among
 * used sites, the one with the oldest last use wins.
 */
export function nextSite(history: { site: InjectionSite | null; taken_at: string }[]): InjectionSite {
  const lastUsed = new Map<InjectionSite, number>()
  for (const h of history) {
    if (!h.site) continue
    const t = new Date(h.taken_at).getTime()
    if ((lastUsed.get(h.site) ?? 0) < t) lastUsed.set(h.site, t)
  }
  const unused = SITE_ORDER.find(s => !lastUsed.has(s))
  if (unused) return unused
  return SITE_ORDER.reduce((best, s) => (lastUsed.get(s)! < lastUsed.get(best)! ? s : best), SITE_ORDER[0])
}

export function siteLabel(key: InjectionSite | null): string {
  return SITES.find(s => s.key === key)?.label ?? 'Not recorded'
}
