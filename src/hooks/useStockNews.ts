'use client'

import { useEffect, useState } from 'react'
import type { NewsArticle } from '@/lib/types'

interface UseStockNewsResult {
  news: NewsArticle[]
  isLoading: boolean
  error: string | null
}

/**
 * Fetches the latest company news articles for a ticker from /api/news/[ticker].
 * Returns an empty array when the API key is missing (graceful fallback).
 */
export function useStockNews(
  ticker: string,
  limit = 10,
  initialData?: NewsArticle[] | undefined,
): UseStockNewsResult {
  const [news, setNews] = useState<NewsArticle[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    const controller = new AbortController()

    fetch(
      `/api/news/${encodeURIComponent(ticker)}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error ?? `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data: NewsArticle[]) => {
        setNews(Array.isArray(data) ? data.slice(0, limit) : [])
        setError(null)
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setError(
          err instanceof Error ? err.message : 'Failed to fetch news',
        )
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [ticker, limit])

  return { news, isLoading, error }
}
