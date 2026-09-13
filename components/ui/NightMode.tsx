'use client'

import { useEffect } from 'react'
import { isNight } from '@/lib/theme/nightMode'

/** Stamps data-mode="night" on <html> inside the user's night window. Re-checks every minute. */
export function NightMode({ start, end }: { start: string; end: string }) {
  useEffect(() => {
    const apply = () => {
      const night = isNight(new Date(), start, end)
      if (night) document.documentElement.setAttribute('data-mode', 'night')
      else document.documentElement.removeAttribute('data-mode')
    }
    apply()
    const id = setInterval(apply, 60_000)
    return () => clearInterval(id)
  }, [start, end])
  return null
}
