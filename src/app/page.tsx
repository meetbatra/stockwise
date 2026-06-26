import { Suspense } from 'react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { fetchChartMeta } from '@/lib/yahoo'
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
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  return formatter.format(num)
}

async function TickerCard({ ticker }: { ticker: string }) {
  let meta
  try {
    meta = await fetchChartMeta(ticker)
  } catch {
    meta = null
  }

  const price = meta?.regularMarketPrice ?? 0
  const prevClose = meta?.chartPreviousClose ?? 0
  const change =
    prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0

  const isUp = change > 0
  const isDown = change < 0
  const trendColorClass = isUp
    ? 'text-trend-up'
    : isDown
      ? 'text-trend-down'
      : 'text-on-surface-variant'

  const sign = change > 0 ? '+' : ''
  const formattedChange = meta ? `${sign}${change.toFixed(2)}%` : '—'
  const displayPrice = meta ? `${price.toFixed(2)}` : '—'
  const volume = meta ? formatCompactNumber(meta.regularMarketVolume) : '—'

  return (
    <Link href={`/${ticker}`} className="group block animate-fade-up">
      <article className="bg-surface-card border border-border-hairline rounded hover:border-border-active transition-colors flex flex-col h-full hover:shadow-lg hover:shadow-primary/5">
        <div className="p-[20px] flex justify-between items-start">
          <div>
            <h2 className="font-label-caps text-xs tracking-widest uppercase text-primary">{ticker}</h2>
            <p className="font-body-sm text-sm text-on-surface-variant truncate max-w-[120px] mt-1">
              {meta?.longName ?? 'Loading...'}
            </p>
          </div>
          <span className={`font-data-mono text-sm ${trendColorClass}`}>
            {formattedChange}
          </span>
        </div>
        <div className="px-[20px] pb-[20px] flex-grow">
          <span className="font-data-mono text-[24px] font-bold text-primary tracking-tight">
            {displayPrice}
          </span>
        </div>
        <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">HIGH</span>
            <span className="font-data-mono text-sm text-primary mt-1">
              {meta ? meta.regularMarketDayHigh.toFixed(2) : '—'}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">VOL</span>
            <span className="font-data-mono text-sm text-primary mt-1">{volume}</span>
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
          href="https://finance.yahoo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          Yahoo Finance
        </a>
        {' '}· Revalidates every 30 s
      </p>
    </main>
  )
}
