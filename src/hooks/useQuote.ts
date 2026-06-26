'use client'

import { useEffect, useRef, useState } from 'react'
import type { FullStockData } from '@/lib/yahoo-fetch'

interface UseQuoteOptions {
  /** Poll interval in milliseconds. Default: 15 000 ms */
  refreshInterval?: number
  /** Whether to start polling immediately. Default: true */
  enabled?: boolean
  /** Initial quote data to bypass the first loading skeleton */
  initialData?: FullStockData | undefined
}

interface UseQuoteResult {
  quote: FullStockData | null
  isLoading: boolean
  error: string | null
  /** Manually trigger a refresh */
  refresh: () => void
}

/**
 * Client-side hook that fetches a real-time stock quote from Yahoo Finance
 * via our own /api/quote/[ticker] route and polls at the given interval.
 */
export function useQuote(
  ticker: string,
  { refreshInterval = 15_000, enabled = true, initialData }: UseQuoteOptions = {},
): UseQuoteResult {
  const [quote, setQuote] = useState<FullStockData | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(!initialData && enabled)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchQuote = async () => {
    if (!enabled || !ticker) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/quote/${encodeURIComponent(ticker)}`, {
        signal: controller.signal,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error ?? `HTTP ${res.status}`)
      }

      const data: FullStockData = await res.json()
      setQuote(data)
      setError(null)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to fetch quote')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchQuote()

    intervalRef.current = setInterval(() => void fetchQuote(), refreshInterval)

    return () => {
      abortRef.current?.abort()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, enabled, refreshInterval])

  return { quote, isLoading, error, refresh: fetchQuote }
}
