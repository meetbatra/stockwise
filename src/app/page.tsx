'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQueryState, parseAsString } from 'nuqs'
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
  return (
    <Suspense fallback={
      <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-24 bg-surface-card rounded"></div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const [screener, setScreener] = useQueryState(
    'filter',
    parseAsString.withDefault(SCREENERS[0]!.id).withOptions({ clearOnDefault: false })
  )
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

  const handlePageChange = (newPage: number | ((p: number) => number)) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        <div className="flex flex-col gap-2 animate-fade-up w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[90px] lg:h-[72px] bg-surface-card border border-border-hairline rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-trend-down bg-surface-card border border-border-hairline rounded-lg">
          <p>{error}</p>
        </div>
      ) : currentStocks.length > 0 ? (
        <section className="flex flex-col gap-2 animate-fade-up w-full">
          {/* Table Header Desktop */}
          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-4 pb-2 border-b border-border-hairline font-label-sm text-[11px] uppercase tracking-[0.1em] text-on-surface-variant/70 mb-2">
            <div>Symbol / Name</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
            <div className="text-right">Day High</div>
            <div className="text-right">Day Low</div>
            <div className="text-right">Market Cap</div>
          </div>

          {currentStocks.map((stock) => {
            const isUp = stock.changePercent > 0
            const isDown = stock.changePercent < 0
            const trendColorClass = isUp
              ? 'text-trend-up'
              : isDown
              ? 'text-trend-down'
              : 'text-on-surface-variant'
            const trendBgClass = isUp
              ? 'bg-trend-up/10 border-trend-up/20'
              : isDown
              ? 'bg-trend-down/10 border-trend-down/20'
              : 'bg-surface-container-high border-border-hairline'

            return (
              <Link key={stock.symbol} href={`/${stock.symbol}`} className="group block">
                <article className="bg-surface-card rounded-xl p-4 flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] lg:items-center gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden border border-border-hairline hover:border-border-active">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
                  
                  {/* Symbol & Name */}
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5 shrink-0">
                      <span className="font-label-caps text-xs tracking-widest uppercase text-primary shrink-0">
                        {stock.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-label-md text-sm text-on-surface font-bold tracking-wider truncate">{stock.symbol}</h3>
                      <p className="font-caption text-xs text-on-surface-variant line-clamp-1">{stock.name}</p>
                    </div>
                  </div>

                  {/* Mobile Price & Change */}
                  <div className="flex justify-between items-center lg:hidden z-10">
                    <div>
                      <div className="font-headline-md text-lg font-bold text-on-surface">${stock.price?.toFixed(2) ?? 'N/A'}</div>
                    </div>
                    <div className={`${trendBgClass} border rounded-full px-2 py-1 flex items-center gap-1`}>
                      <span className={`font-caption text-xs font-semibold ${trendColorClass}`}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden lg:block text-right z-10">
                    <div className="font-label-md text-sm text-on-surface font-bold">${stock.price?.toFixed(2) ?? 'N/A'}</div>
                  </div>
                  
                  {/* Desktop Change */}
                  <div className="hidden lg:flex justify-end z-10">
                    <div className={`${trendBgClass} border rounded-full px-2 py-1 flex items-center gap-1`}>
                      <span className={`font-caption text-xs font-semibold ${trendColorClass}`}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* OHL (High/Low/Market Cap) Mobile/Desktop */}
                  <div className="flex justify-between lg:contents z-10 pt-4 lg:pt-0 border-t border-border-hairline lg:border-t-0 mt-2 lg:mt-0">
                    <div className="flex flex-col lg:text-right">
                      <span className="font-caption text-[10px] uppercase tracking-wider text-on-surface-variant/70 lg:hidden">High</span>
                      <span className="font-label-md text-sm text-on-surface-variant">${stock.dayHigh?.toFixed(2) ?? 'N/A'}</span>
                    </div>
                    <div className="flex flex-col lg:text-right">
                      <span className="font-caption text-[10px] uppercase tracking-wider text-on-surface-variant/70 lg:hidden">Low</span>
                      <span className="font-label-md text-sm text-on-surface-variant">${stock.dayLow?.toFixed(2) ?? 'N/A'}</span>
                    </div>
                    <div className="flex flex-col lg:text-right">
                      <span className="font-caption text-[10px] uppercase tracking-wider text-on-surface-variant/70 lg:hidden">Mkt Cap</span>
                      <span className="font-label-md text-sm text-on-surface-variant">{formatCompact(stock.marketCap)}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-0 pointer-events-none"></div>
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
            onClick={() => handlePageChange(p => Math.max(1, p - 1))}
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
                    onClick={() => handlePageChange(p)}
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
            onClick={() => handlePageChange(p => Math.min(totalPages, p + 1))}
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
