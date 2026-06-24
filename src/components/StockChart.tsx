'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useStockChart } from '@/hooks/useStockChart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Resolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'

interface Range {
  label: string
  days: number
  resolution: Resolution
}

const RANGES: Range[] = [
  { label: '1W', days: 7, resolution: '60' },
  { label: '1M', days: 30, resolution: 'D' },
  { label: '3M', days: 90, resolution: 'D' },
  { label: '6M', days: 180, resolution: 'D' },
  { label: '1Y', days: 365, resolution: 'D' },
]

interface StockChartProps {
  ticker: string
}

export function StockChart({ ticker }: StockChartProps) {
  const [rangeIdx, setRangeIdx] = useState(2) // default 3M
  // rangeIdx is always a valid index — assert non-null
  const range = RANGES[rangeIdx]!

  const fromUnix = useMemo(
    () => Math.floor((Date.now() - range.days * 86_400_000) / 1000),
    [range.days],
  )

  const { candles, isLoading, error } = useStockChart(ticker, {
    resolution: range.resolution,
    from: fromUnix,
  })

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
    date: new Date(c.time * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                i === rangeIdx
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {r.label}
            </button>
          ))}
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
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formatted}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 6%)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'oklch(0.56 0 0)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
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
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const entry = payload[0]
                  if (!entry) return null
                  const d = entry.payload as {
                    date: string
                    close: number
                    volume: number
                  }
                  return (
                    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 shadow-xl text-xs space-y-1">
                      <p className="font-medium text-foreground">{d.date}</p>
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
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={`url(#${fillId})`}
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
