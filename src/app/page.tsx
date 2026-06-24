import { Suspense } from 'react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fetchQuote, fetchProfile } from '@/lib/finnhub'
import { SUPPORTED_TICKERS } from '@/lib/tickers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Stockwise — Stock Analytics Dashboard',
  description:
    'Real-time market overview for top US equities. Click any card for the full analysis.',
}

// Revalidate every 30 s so all cards stay fresh
export const revalidate = 30

async function TickerCard({ ticker }: { ticker: string }) {
  const [quoteResult, profileResult] = await Promise.allSettled([
    fetchQuote(ticker),
    fetchProfile(ticker),
  ])

  const q = quoteResult.status === 'fulfilled' ? quoteResult.value : null
  const p = profileResult.status === 'fulfilled' ? profileResult.value : null

  const change = q?.dp ?? 0
  const isUp = change > 0
  const isDown = change < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <Link href={`/${ticker}`} className="group block animate-fade-up">
      <Card className="h-full border-border/50 bg-card hover:border-emerald-500/40 hover:bg-card/80 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {p?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logo}
                  alt={ticker}
                  className="h-8 w-8 shrink-0 rounded-lg object-contain bg-white/5 p-0.5 border border-border/40"
                />
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {ticker.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide">{ticker}</p>
                <p className="text-[11px] text-muted-foreground truncate max-w-28">
                  {p?.name ?? 'Loading…'}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={[
                'shrink-0 text-[11px] px-2 py-0.5',
                isUp
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : isDown
                    ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                    : 'border-border text-muted-foreground',
              ].join(' ')}
            >
              <TrendIcon className="h-2.5 w-2.5 mr-1" />
              {change > 0 ? '+' : ''}
              {change.toFixed(2)}%
            </Badge>
          </div>

          {/* Price */}
          <div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {q ? `$${q.c.toFixed(2)}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {q
                ? `${q.d >= 0 ? '+' : ''}$${q.d.toFixed(2)} today`
                : 'No data'}
            </p>
          </div>

          {/* Mini OHLC */}
          {q && (
            <div className="grid grid-cols-3 gap-1 border-t border-border/40 pt-2">
              {[
                { label: 'Open', value: q.o },
                { label: 'High', value: q.h },
                { label: 'Low', value: q.l },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-medium tabular-nums">
                    ${value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function TickerCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3 w-22" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-border/40 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-6" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      {/* Hero */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time quotes for top US equities. Click any card for the full analysis.
        </p>
      </div>

      {/* Ticker grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
        {SUPPORTED_TICKERS.map((ticker) => (
          <Suspense key={ticker} fallback={<TickerCardSkeleton />}>
            <TickerCard ticker={ticker} />
          </Suspense>
        ))}
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Data via{' '}
        <a
          href="https://finnhub.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Finnhub
        </a>
        {' '}· Revalidates every 30 s
      </p>
    </div>
  )
}
