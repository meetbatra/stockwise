'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TrendingUp, Search } from 'lucide-react'
import { useState } from 'react'
import { SUPPORTED_TICKERS } from '@/lib/tickers'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const ticker = query.trim().toUpperCase()
    if (ticker) {
      router.push(`/${ticker}`)
      setQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline text-sm">Stockwise</span>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-4 w-px bg-border" />

        {/* Quick-access tickers */}
        <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto">
          {SUPPORTED_TICKERS.slice(0, 7).map((t) => {
            const active = pathname === `/${t}`
            return (
              <Link
                key={t}
                href={`/${t}`}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {t}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            id="ticker-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker…"
            autoCapitalize="characters"
            className="h-8 w-32 sm:w-44 rounded-md border border-border bg-muted/40 pl-7 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all"
          />
        </form>
      </div>
    </header>
  )
}
