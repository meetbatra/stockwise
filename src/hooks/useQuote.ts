'use client'

import { useEffect, useRef, useState } from 'react'
import type { Quote } from '@/lib/types'

interface UseQuoteOptions {
  /** Poll interval in milliseconds. Default: 15 000 ms */
  refreshInterval?: number
  /** Whether to start polling immediately. Default: true */
  enabled?: boolean
}

interface UseQuoteResult {
  quote: Quote | null
  isLoading: boolean
  error: string | null
  /** Manually trigger a refresh */
  refresh: () => void
}

/**
 * Client-side hook that fetches a real-time stock quote and polls at the
 * given interval.  Calls our own /api/quote/[ticker] to keep the Finnhub key
 * server-side.
 */
export function useQuote(
  ticker: string,
  { refreshInterval = 15_000, enabled = true }: UseQuoteOptions = {},
): UseQuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

      const { quote } = await res.json()
      setQuote(quote)
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

    setIsLoading(true)
    fetchQuote()

    intervalRef.current = setInterval(fetchQuote, refreshInterval)

    return () => {
      abortRef.current?.abort()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, enabled, refreshInterval])

  return { quote, isLoading, error, refresh: fetchQuote }
}
