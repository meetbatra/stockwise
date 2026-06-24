'use client'

import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuote } from '@/hooks/useQuote'
import { cn } from '@/lib/utils'
import type { CompanyProfile } from '@/lib/types'

interface PriceHeaderProps {
  ticker: string
  profile: CompanyProfile | null
}

export function PriceHeader({ ticker, profile }: PriceHeaderProps) {
  const { quote, isLoading, error, refresh } = useQuote(ticker, {
    refreshInterval: 15_000,
  })

  if (isLoading) return <PriceHeaderSkeleton />

  if (error || !quote) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <span>Failed to load quote.</span>
        <button
          onClick={refresh}
          className="flex items-center gap-1 text-xs underline hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  const change = quote.dp
  const isUp = change > 0
  const isDown = change < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <div className="animate-fade-up space-y-2">
      {/* Company name + exchange */}
      <div className="flex items-center gap-3">
        {profile?.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt={ticker}
            className="h-9 w-9 rounded-lg object-contain bg-white/5 p-1 border border-border/50"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile?.name ?? ticker}
          </h1>
          <p className="text-xs text-muted-foreground">
            {ticker} · {profile?.exchange ?? 'NASDAQ'} · {profile?.currency ?? 'USD'}
          </p>
        </div>
      </div>

      {/* Price row */}
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-4xl font-bold tabular-nums tracking-tight">
          ${quote.c.toFixed(2)}
        </span>

        <Badge
          variant="outline"
          className={cn(
            'text-sm px-2.5 py-1 font-medium',
            isUp
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
              : isDown
                ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                : 'border-border text-muted-foreground',
          )}
        >
          <TrendIcon className="h-3.5 w-3.5 mr-1.5" />
          {change > 0 ? '+' : ''}${quote.d.toFixed(2)} ({change > 0 ? '+' : ''}
          {change.toFixed(2)}%)
        </Badge>

        <span className="text-xs text-muted-foreground self-end pb-0.5">
          Prev close: ${quote.pc.toFixed(2)}
        </span>

        {/* Live indicator */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground self-end pb-0.5 ml-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ticker-pulse" />
          Live · refreshes every 15 s
        </span>
      </div>

      {/* OHLC bar */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
        {[
          { label: 'Open', value: quote.o },
          { label: 'High', value: quote.h },
          { label: 'Low', value: quote.l },
          { label: 'Prev Close', value: quote.pc },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium tabular-nums">
              ${value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="flex gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
    </div>
  )
}
