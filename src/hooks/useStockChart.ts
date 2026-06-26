'use client'

import { useEffect, useState } from 'react'
import type { CandlePoint } from '@/lib/types'

interface UseStockChartOptions {
  interval?: string
  from?: number
  to?: number
  enabled?: boolean
  initialData?: CandlePoint[] | undefined
}

interface UseStockChartResult {
  candles: CandlePoint[]
  isLoading: boolean
  error: string | null
  firstAvailableTimestamp?: number | undefined
}

// In-memory cache shared across hook instances
export const chartCache = new Map<string, CandlePoint[]>()

/**
 * Fetches OHLCV candle data for the given ticker from /api/candles/[ticker].
 * Uses a smart cache: fetches 1Y for '1d' interval, and 1W for '60m' interval,
 * so that switching between ranges is instantaneous.
 */
export function useStockChart(
  ticker: string,
  {
    interval = '1d',
    from,
    to,
    enabled = true,
    initialData,
  }: UseStockChartOptions = {},
): UseStockChartResult {
  const [candles, setCandles] = useState<CandlePoint[]>(() => {
    if (initialData) {
      chartCache.set(`${ticker}-${interval}`, initialData)
      let filtered = initialData
      if (from) filtered = filtered.filter((c) => c.time >= from)
      if (to) filtered = filtered.filter((c) => c.time <= to)
      return filtered
    }
    return []
  })
  
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [firstAvailableTimestamp, setFirstAvailableTimestamp] = useState<number | undefined>(() => {
    if (initialData && initialData.length > 0) return initialData[0]!.time
    return undefined
  })

  useEffect(() => {
    if (!enabled || !ticker) return

    const now = Math.floor(Date.now() / 1000)
    // Always fetch max range for the interval to populate cache
    const fetchDays = interval === '1d' ? 365 : 7
    const fetchFrom = now - fetchDays * 86_400
    const cacheKey = `${ticker}-${interval}`

    const filterAndSet = (data: CandlePoint[]) => {
      let filtered = data
      if (from) filtered = filtered.filter((c) => c.time >= from)
      if (to) filtered = filtered.filter((c) => c.time <= to)
      setCandles(filtered)
      if (data.length > 0) {
        setFirstAvailableTimestamp((prev) => 
          prev === undefined ? data[0]!.time : Math.min(prev, data[0]!.time)
        )
      }
    }

    if (chartCache.has(cacheKey)) {
      filterAndSet(chartCache.get(cacheKey)!)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    const controller = new AbortController()

    const params = new URLSearchParams({ interval })
    params.set('from', String(fetchFrom))
    params.set('to', String(now))

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
      .then((data: CandlePoint[]) => {
        chartCache.set(cacheKey, data)
        filterAndSet(data)
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
  }, [ticker, interval, from, to, enabled])

  return { candles, isLoading, error, firstAvailableTimestamp }
}
