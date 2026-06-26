'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import type { StockData } from '@/lib/yahoo-fetch'

const SCREENERS = [
  { id: 'most_actives', label: 'Most Actives' },
  { id: 'day_gainers', label: 'Day Gainers' },
  { id: 'day_losers', label: 'Day Losers' },
  { id: 'undervalued_large_caps', label: 'Value (Large)' },
  { id: 'growth_technology_stocks', label: 'Tech Growth' },
  { id: 'undervalued_growth_stocks', label: 'Value Growth' },
  { id: 'small_cap_gainers', label: 'Small Cap Gainers' },
]

const PAGE_SIZE = 10

function formatCompact(n: number): string {
  if (!n) return 'N/A'
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

export default function HomePage() {
  const [screener, setScreener] = useState(SCREENERS[0]!.id)
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)

  // 1. Fetch on mount and on screener change
  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)

    fetch(`/api/stocks/top50?screener=${screener}&size=50`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        if (active) {
          setStocks(data.stocks || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err)
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [screener])

  // 2. Reset search and page on screener change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [screener])

  // Reset page to 1 on search change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch])

  // 3. Filter stocks in memory
  const filteredStocks = useMemo(() => {
    if (!debouncedSearch) return stocks
    const lowerSearch = debouncedSearch.toLowerCase()
    return stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(lowerSearch) ||
        s.name.toLowerCase().includes(lowerSearch)
    )
  }, [stocks, debouncedSearch])

  // 4. Paginate filtered stocks
  const totalItems = filteredStocks.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const currentStocks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredStocks.slice(start, start + PAGE_SIZE)
  }, [filteredStocks, page])

  const handleScreenerChange = (id: string) => {
    setScreener(id)
  }

  return (
    <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2 animate-fade-up">
        <h1 className="font-headline-lg text-3xl md:text-4xl text-primary tracking-tight font-semibold">
          Market Overview
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant">
          Top 50 stocks categorized by market movement.
        </p>
      </section>

      {/* Screener Selector */}
      <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-none animate-fade-up">
        {SCREENERS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleScreenerChange(s.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border border-border-hairline ${
              screener === s.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface-card text-on-surface-variant hover:text-primary hover:border-border-active'
            }`}
          >
            {s.label}
          </button>
        ))}
      </section>

      {/* Controls: Search and Count */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-up">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol or name..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-card border border-border-hairline text-sm text-primary placeholder:text-on-surface-variant focus:outline-none focus:border-ring/50 focus:ring-1 focus:ring-ring/30 transition-colors"
          />
        </div>
        <div className="text-sm text-on-surface-variant">
          Showing {totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems} stocks
        </div>
      </section>

      {/* Stock Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-up">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[170px] bg-surface-card border border-border-hairline rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-trend-down bg-surface-card border border-border-hairline rounded-lg">
          <p>{error}</p>
        </div>
      ) : currentStocks.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-up">
          {currentStocks.map((stock) => {
            const isUp = stock.changePercent > 0
            const isDown = stock.changePercent < 0
            const trendColorClass = isUp
              ? 'text-trend-up'
              : isDown
              ? 'text-trend-down'
              : 'text-on-surface-variant'
            const arrow = isUp ? '▲' : isDown ? '▼' : '—'

            return (
              <Link key={stock.symbol} href={`/${stock.symbol}`} className="group block">
                <article className="bg-surface-card border border-border-hairline rounded-lg hover:border-border-active transition-colors flex flex-col h-full hover:shadow-lg hover:shadow-primary/5">
                  <div className="p-[20px] flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="font-label-caps text-xs tracking-widest uppercase text-primary shrink-0">
                        {stock.symbol}
                      </span>
                      <p className="font-body-sm text-sm text-on-surface-variant truncate max-w-[140px] mt-1">
                        {stock.name}
                      </p>
                    </div>
                    <span className={`font-data-mono text-sm shrink-0 ${trendColorClass}`}>
                      {arrow} {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="px-[20px] pb-[20px] flex-grow">
                    <span className="font-data-mono text-[24px] font-bold text-primary tracking-tight">
                      ${stock.price?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>

                  <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">
                        MKT CAP
                      </span>
                      <span className="font-data-mono text-sm text-primary mt-1">
                        {formatCompact(stock.marketCap)}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">
                        VOL
                      </span>
                      <span className="font-data-mono text-sm text-primary mt-1">
                        {formatCompact(stock.volume)}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </section>
      ) : (
        <div className="py-12 text-center text-on-surface-variant bg-surface-card border border-border-hairline rounded-lg">
          <p>No stocks found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-4 animate-fade-up">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-sm text-on-surface-variant hover:bg-border-active hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              // Simple pagination logic for demo
              if (
                p === 1 || 
                p === totalPages || 
                (p >= page - 1 && p <= page + 1)
              ) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-ring/15 text-ring border border-ring/30'
                        : 'text-on-surface-variant hover:bg-border-active hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                )
              } else if (p === page - 2 || p === page + 2) {
                return <span key={p} className="flex items-center justify-center w-9 h-9 text-sm text-on-surface-variant/50">...</span>
              }
              return null
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-sm text-on-surface-variant hover:bg-border-active hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
