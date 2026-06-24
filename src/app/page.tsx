import { Suspense } from 'react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { fetchQuote, fetchProfile } from '@/lib/finnhub'
import { SUPPORTED_TICKERS } from '@/lib/tickers'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Stockwise — Stock Analytics Dashboard',
  description:
    'Real-time market overview for top US equities. Click any card for the full analysis.',
}

export const revalidate = 30

function formatCompactNumber(num: number) {
  const formatter = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  })
  return formatter.format(num)
}

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
  const trendColorClass = isUp ? 'text-trend-up' : isDown ? 'text-trend-down' : 'text-on-surface-variant'

  const sign = change > 0 ? '+' : ''
  const formattedChange = `${sign}${change.toFixed(2)}%`
  const price = q ? q.c.toFixed(2) : '—'
  const open = q ? q.o.toFixed(2) : '—'
  const mcap = p?.marketCapitalization ? formatCompactNumber(p.marketCapitalization * 1e6) : '—'

  return (
    <Link href={`/${ticker}`} className="group block animate-fade-up">
      <article className="bg-surface-card border border-border-hairline rounded hover:border-border-active transition-colors flex flex-col h-full hover:shadow-lg hover:shadow-primary/5">
        <div className="p-[20px] flex justify-between items-start">
          <div>
            <h2 className="font-label-caps text-xs tracking-widest uppercase text-primary">{ticker}</h2>
            <p className="font-body-sm text-sm text-on-surface-variant truncate max-w-[120px] mt-1">{p?.name ?? 'Loading...'}</p>
          </div>
          <span className={`font-data-mono text-sm ${trendColorClass}`}>
            {formattedChange}
          </span>
        </div>
        <div className="px-[20px] pb-[20px] flex-grow">
          <span className="font-data-mono text-[24px] font-bold text-primary tracking-tight">
            {price}
          </span>
        </div>
        <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">OPEN</span>
            <span className="font-data-mono text-sm text-primary mt-1">{open}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">MCAP</span>
            <span className="font-data-mono text-sm text-primary mt-1">{mcap}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function TickerCardSkeleton() {
  return (
    <article className="bg-surface-card border border-border-hairline rounded flex flex-col h-[170px]">
      <div className="p-[20px] flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-border-active" />
          <Skeleton className="h-3 w-24 bg-border-active" />
        </div>
        <Skeleton className="h-4 w-16 bg-border-active" />
      </div>
      <div className="px-[20px] pb-[20px] flex-grow">
        <Skeleton className="h-8 w-20 bg-border-active" />
      </div>
      <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
        <div className="space-y-1">
          <Skeleton className="h-2 w-8 bg-border-active" />
          <Skeleton className="h-4 w-12 bg-border-active" />
        </div>
        <div className="space-y-1 items-end flex flex-col">
          <Skeleton className="h-2 w-8 bg-border-active" />
          <Skeleton className="h-4 w-12 bg-border-active" />
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  return (
    <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      <section className="flex flex-col gap-2 animate-fade-up">
        <h1 className="font-headline-lg text-3xl md:text-4xl text-primary tracking-tight font-semibold">Market Overview</h1>
        <p className="font-body-sm text-sm text-on-surface-variant">Real-time institutional grade data visualization.</p>
      </section>

      {/* Stock Grid (Bento Style) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
        {SUPPORTED_TICKERS.map((ticker) => (
          <Suspense key={ticker} fallback={<TickerCardSkeleton />}>
            <TickerCard ticker={ticker} />
          </Suspense>
        ))}
      </section>

      {/* Footer */}
      <p className="text-[11px] text-on-surface-variant text-center pt-2">
        Data via{' '}
        <a
          href="https://finnhub.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          Finnhub
        </a>
        {' '}· Revalidates every 30 s
      </p>
    </main>
  )
}
