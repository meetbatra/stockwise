'use client'

import { useEffect, useState } from 'react'
import type { CandlePoint } from '@/lib/types'

type Resolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'

interface UseStockChartOptions {
  resolution?: Resolution
  from?: number
  to?: number
  enabled?: boolean
}

interface UseStockChartResult {
  candles: CandlePoint[]
  isLoading: boolean
  error: string | null
}

/**
 * Fetches OHLCV candle data for the given ticker from /api/candles/[ticker].
 * Re-fetches whenever ticker or resolution changes.
 */
export function useStockChart(
  ticker: string,
  {
    resolution = 'D',
    from,
    to,
    enabled = true,
  }: UseStockChartOptions = {},
): UseStockChartResult {
  const [candles, setCandles] = useState<CandlePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !ticker) return

    const controller = new AbortController()
    setIsLoading(true)

    const params = new URLSearchParams({ resolution })
    if (from) params.set('from', String(from))
    if (to) params.set('to', String(to))

    fetch(
      `/api/candles/${encodeURIComponent(ticker)}?${params.toString()}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error ?? `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then(({ candles }) => {
        setCandles(candles)
        setError(null)
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setError(
          err instanceof Error ? err.message : 'Failed to fetch candles',
        )
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [ticker, resolution, from, to, enabled])

  return { candles, isLoading, error }
}
