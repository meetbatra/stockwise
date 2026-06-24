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
 */
export function useStockNews(
  ticker: string,
  limit = 10,
): UseStockNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    const controller = new AbortController()
    setIsLoading(true)

    fetch(
      `/api/news/${encodeURIComponent(ticker)}?limit=${limit}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error ?? `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then(({ news }) => {
        setNews(news)
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
