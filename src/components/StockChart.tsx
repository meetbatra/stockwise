'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useStockChart, chartCache } from '@/hooks/useStockChart'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import type { CandlePoint } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Range {
  label: string
  days: number
  interval: string
}

const RANGES: Range[] = [
  { label: '1W', days: 7, interval: '60m' },
  { label: '1M', days: 30, interval: '1d' },
  { label: '3M', days: 90, interval: '1d' },
  { label: '6M', days: 180, interval: '1d' },
  { label: '1Y', days: 365, interval: '1d' },
]

interface StockChartProps {
  ticker: string
  initialCandles?: CandlePoint[] | undefined
  initialWeeklyCandles?: CandlePoint[] | undefined
}

export function StockChart({ ticker, initialCandles, initialWeeklyCandles }: StockChartProps) {
  // Pre-populate cache synchronously so that switching ranges (like to 1W) hits the cache immediately
  if (initialCandles && !chartCache.has(`${ticker}-1d`)) {
    chartCache.set(`${ticker}-1d`, initialCandles)
  }
  if (initialWeeklyCandles && !chartCache.has(`${ticker}-60m`)) {
    chartCache.set(`${ticker}-60m`, initialWeeklyCandles)
  }

  const [rangeIdx, setRangeIdx] = useState(2) // default 3M
  const range = RANGES[rangeIdx]!

  // Stable mount-time snapshot used to calculate "from" for chart requests
  const [mountTime] = useState(() => Math.floor(Date.now() / 1000))

  const { candles, isLoading, error, firstAvailableTimestamp } = useStockChart(
    ticker,
    {
      interval: range.interval,
      from: mountTime - range.days * 86_400,
      initialData: range.interval === '1d' ? initialCandles : initialWeeklyCandles,
    },
  )

  // Calculate max available days to disable invalid ranges for new stocks/IPOs
  const maxAvailableDays = firstAvailableTimestamp
    ? Math.floor((mountTime - firstAvailableTimestamp) / 86400)
    : Infinity

  // Helper to check if a range is valid. 
  // It is valid if we have more data than the PREVIOUS range's days (with an 80% multiplier for weekends)
  const isRangeValid = (idx: number) => {
    if (idx === 0 || maxAvailableDays === Infinity) return true
    const prevRangeDays = RANGES[idx - 1]!.days
    return maxAvailableDays > prevRangeDays * 0.8
  }

  // Automatically adjust the default selection if the stock's data is shorter than the default
  useEffect(() => {
    if (maxAvailableDays !== Infinity && !isRangeValid(rangeIdx)) {
      for (let i = RANGES.length - 1; i >= 0; i--) {
        if (isRangeValid(i)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRangeIdx(i)
          break
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAvailableDays, rangeIdx])

  // Determine chart colour based on first vs last close
  const first = candles[0]
  const last = candles[candles.length - 1]
  const isPositive =
    first !== undefined && last !== undefined
      ? last.close >= first.close
      : true

  const strokeColor = isPositive ? '#34d399' : '#f87171' // emerald-400 / rose-400
  const fillId = `fill-${ticker}`

  const formatted = candles.map((c) => ({
    time: c.time,
    fullDate: new Date(c.time * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(range.interval === '60m' ? { hour: 'numeric', minute: '2-digit' } : {}),
      ...(range.days > 180 ? { year: '2-digit' } : {}),
    }),
    close: c.close,
    volume: c.volume,
  }))

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Price Chart</p>
        <div className="flex gap-1">
          {RANGES.map((r, i) => {
            const isDisabled = !isRangeValid(i)

            return (
              <button
                key={r.label}
                onClick={() => setRangeIdx(i)}
                disabled={isDisabled}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  i === rangeIdx
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : isDisabled
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
                title={isDisabled ? 'Not enough historical data' : undefined}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart body */}
      {isLoading ? (
        <Skeleton className="h-60 w-full rounded-xl bg-slate-800/50" />
      ) : error || !formatted.length ? (
        <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
          {error ?? 'No chart data available for this range.'}
        </div>
      ) : (
        <ChartContainer
          config={{
            close: {
              label: 'Price',
              color: strokeColor,
            },
          }}
          className="h-60 w-full"
        >
          <AreaChart
            data={formatted}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-close)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-close)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(1 0 0 / 6%)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tickFormatter={(val: number) => {
                const d = new Date(val * 1000)
                if (range.interval === '60m') {
                  return d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    hour: 'numeric',
                  })
                }
                return d.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  ...(range.days > 180 ? { year: '2-digit' } : {}),
                })
              }}
              tick={{ fontSize: 10, fill: 'oklch(0.56 0 0)' }}
              tickLine={false}
              axisLine={false}
              interval="equidistantPreserveStart"
              minTickGap={40}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: 'oklch(0.56 0 0)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              width={52}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const entry = payload[0]
                if (!entry) return null
                const d = entry.payload as {
                  time: number
                  fullDate: string
                  close: number
                  volume: number
                }
                return (
                  <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 shadow-xl text-xs space-y-1">
                    <p className="font-medium text-foreground">{d.fullDate}</p>
                    <p
                      className="tabular-nums"
                      style={{ color: strokeColor }}
                    >
                      Close: ${d.close.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground tabular-nums">
                      Vol: {(d.volume / 1_000_000).toFixed(2)}M
                    </p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="var(--color-close)"
              strokeWidth={1.5}
              fill={`url(#${fillId})`}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-close)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}
