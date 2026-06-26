import ky from 'ky'
import type { NewsArticle } from '@/lib/types'

const finnhub = ky.create({
  prefix: 'https://finnhub.io/api/v1',
})

/**
 * Fetches recent company news articles for a ticker from Finnhub.
 * Returns [] immediately if FINNHUB_API_KEY is not set.
 * On any network or HTTP error, logs the error and returns [].
 */
export async function fetchNews(ticker: string): Promise<NewsArticle[]> {
  const key = process.env.FINNHUB_API_KEY
  if (!key) {
    return []
  }

  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)

  const fmt = (d: Date) => d.toISOString().slice(0, 10) // YYYY-MM-DD

  try {
    const articles = await finnhub
      .get('company-news', {
        searchParams: {
          symbol: ticker.toUpperCase(),
          from: fmt(from),
          to: fmt(to),
          token: key,
        },
      })
      .json<NewsArticle[]>()

    return Array.isArray(articles) ? articles.slice(0, 10) : []
  } catch (err) {
    console.error(`[finnhub] Error fetching news for ${ticker}:`, err)
    return []
  }
}
