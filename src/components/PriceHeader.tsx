'use client'

import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuote } from '@/hooks/useQuote'
import { cn } from '@/lib/utils'

import type { FullStockData } from '@/lib/yahoo-fetch'

interface PriceHeaderProps {
  ticker: string
  initialQuote?: FullStockData | undefined
}

export function PriceHeader({ ticker, initialQuote }: PriceHeaderProps) {
  const { quote, isLoading, error, refresh } = useQuote(ticker, {
    refreshInterval: 15_000,
    initialData: initialQuote,
  })

  if (isLoading) return <PriceHeaderSkeleton />

  if (error || !quote) {
    return (
      <div className="flex items-center gap-3 text-slate-400 text-sm">
        <span>Failed to load quote.</span>
        <button
          onClick={refresh}
          className="flex items-center gap-1 text-xs underline hover:text-white"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  const price = quote.price
  const change = quote.change
  const changePct = quote.changePercent
  const isUp = change > 0
  const isDown = change < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <div className="animate-fade-up space-y-4">
      {/* Company name + exchange */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {quote.longName || quote.name || ticker}
          </h1>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase mt-1">
            {ticker} <span className="mx-1.5 opacity-50">·</span>{' '}
            {quote.exchange || 'N/A'} <span className="mx-1.5 opacity-50">·</span>{' '}
            {quote.currency || 'USD'}
          </p>
        </div>
      </div>

      {/* Price row */}
      <div className="flex flex-wrap items-end gap-4 bg-surface-card border border-hairline p-5 rounded-2xl">
        <span className="text-5xl font-mono font-semibold tabular-nums tracking-tight text-white">
          ${price.toFixed(2)}
        </span>

        <Badge
          variant="outline"
          className={cn(
            'text-sm px-3 py-1 font-mono font-medium',
            isUp
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
              : isDown
                ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                : 'border-border text-slate-400',
          )}
        >
          <TrendIcon className="h-4 w-4 mr-2" />
          {change > 0 ? '+' : ''}${Math.abs(change).toFixed(2)} (
          {changePct > 0 ? '+' : ''}
          {changePct.toFixed(2)}%)
        </Badge>

        <span className="text-sm font-mono text-slate-400 self-end pb-1">
          Prev Close:{' '}
          <span className="text-slate-200">${(price - change).toFixed(2)}</span>
        </span>

        {/* Live indicator */}
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-slate-400 self-end pb-1 ml-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ticker-pulse" />
          Live
        </span>
      </div>
    </div>
  )
}

function PriceHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-end gap-4 p-5 rounded-2xl bg-surface-card border border-hairline">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
    </div>
  )
}
