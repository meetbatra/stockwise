'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
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
    <header className="fixed top-0 w-full z-50 bg-surface-card/80 backdrop-blur-md border-b border-border-hairline">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-surface-card font-label-caps text-[10px] font-bold">SW</span>
          </div>
          <span className="font-headline-lg text-lg text-primary tracking-tight">
            Stockwise
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
          <input
            id="ticker-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker…"
            autoCapitalize="characters"
            className="h-10 w-40 sm:w-64 rounded-lg border border-[#333333] bg-[#141414] pl-9 pr-4 text-sm text-primary placeholder:text-[#888888] focus:outline-none focus:border-[#555555] focus:ring-1 focus:ring-[#555555] transition-all shadow-sm"
          />
        </form>
      </div>
    </header>
  )
}
