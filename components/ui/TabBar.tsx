'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Syringe, UtensilsCrossed, Moon, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/today', label: 'Today', Icon: Sun },
  { href: '/protocol', label: 'Protocol', Icon: Syringe },
  { href: '/food', label: 'Food', Icon: UtensilsCrossed },
  { href: '/sleep', label: 'Sleep', Icon: Moon },
  { href: '/learn', label: 'Learn', Icon: BookOpen },
]

export function TabBar() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-line safe-bottom z-40">
      <ul className="flex justify-around max-w-md mx-auto">
        {TABS.map(({ href, label, Icon }) => {
          const on = path === href || path.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn('flex flex-col items-center gap-1 px-3 pt-2.5 pb-2 text-[10px] font-semibold', on ? 'text-accent' : 'text-muted')}
                aria-current={on ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={on ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
