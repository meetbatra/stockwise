'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useQueryState, parseAsString } from 'nuqs'
import { useDebounce } from '@/hooks/use-debounce'
import { Input } from '@/components/ui/input'
import { ScreenerFilter, SCREENERS } from '@/components/ScreenerFilter'
import { StockPagination } from '@/components/StockPagination'
import { LoadingRows } from './loading'
import type { StockData } from '@/lib/yahoo-fetch'

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
          <div className="h-4 w-24 bg-surface-card rounded" />
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

  // Fetch on mount and on screener change
  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetch(`/api/stocks/top50?screener=${screener}&size=50`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)
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

    return () => { active = false }
  }, [screener])

  // Reset search and page on screener change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch('')
    setPage(1)
  }, [screener])

  // Reset page to 1 on search change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleScreenerChange = (id: string) => {
    setScreener(id)
  }

  // Filter stocks in memory
  const filteredStocks = useMemo(() => {
    if (!debouncedSearch) return stocks
    const q = debouncedSearch.toLowerCase()
    return stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }, [stocks, debouncedSearch])

  // Paginate filtered stocks
  const totalItems = filteredStocks.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const currentStocks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredStocks.slice(start, start + PAGE_SIZE)
  }, [filteredStocks, page])

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

      {/* Screener Filter */}
      <ScreenerFilter activeScreener={screener} onScreenerChange={handleScreenerChange} />

      {/* Search + Count */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-up">
        <div className="relative w-full sm:max-w-xs">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            placeholder="Search symbol or name..."
            className="pl-9 h-10 bg-surface-card border-border-hairline text-primary placeholder:text-on-surface-variant focus:border-ring/50 focus:ring-ring/30 disabled:opacity-50"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <div className="text-sm text-on-surface-variant">
          Showing {totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems} stocks
        </div>
      </section>

      {/* Stock List */}
      {loading ? (
        <LoadingRows />
      ) : error ? (
        <div className="py-12 text-center text-trend-down bg-surface-card border border-border-hairline rounded-lg">
          <p>{error}</p>
        </div>
      ) : currentStocks.length > 0 ? (
        <section className="flex flex-col gap-2 animate-fade-up w-full">
          {/* Table Header — desktop only */}
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
            const trendColorClass = isUp ? 'text-trend-up' : isDown ? 'text-trend-down' : 'text-on-surface-variant'
            const trendBgClass = isUp
              ? 'bg-trend-up/10 border-trend-up/20'
              : isDown
                ? 'bg-trend-down/10 border-trend-down/20'
                : 'bg-surface-container-high border-border-hairline'

            return (
              <Link key={stock.symbol} href={`/${stock.symbol}`} className="group block">
                <article className="bg-surface-card rounded-xl p-4 flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] lg:items-center cursor-pointer transition-all duration-300 relative overflow-hidden border border-border-hairline hover:border-border-active">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

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

                  {/* Mobile: Price & Change */}
                  <div className="flex justify-between items-center lg:hidden z-10">
                    <div className="font-headline-md text-lg font-bold text-on-surface">
                      ${stock.price?.toFixed(2) ?? 'N/A'}
                    </div>
                    <div className={`${trendBgClass} border rounded-full px-2 py-1 flex items-center gap-1`}>
                      <span className={`font-caption text-xs font-semibold ${trendColorClass}`}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Desktop: Price */}
                  <div className="hidden lg:block text-right z-10">
                    <div className="font-label-md text-sm text-on-surface font-bold">
                      ${stock.price?.toFixed(2) ?? 'N/A'}
                    </div>
                  </div>

                  {/* Desktop: Change */}
                  <div className="hidden lg:flex justify-end z-10">
                    <div className={`${trendBgClass} border rounded-full px-2 py-1 flex items-center gap-1`}>
                      <span className={`font-caption text-xs font-semibold ${trendColorClass}`}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* High / Low / Market Cap */}
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

                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-0 pointer-events-none" />
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

      {/* Pagination */}
      <StockPagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
