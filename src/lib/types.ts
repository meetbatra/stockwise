// ─── Normalised Types used inside the app ─────────────────────────────────────

/** Normalised candle entry (one per data point) */
export interface CandlePoint {
  time: number // unix timestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// ─── Finnhub News Types ───────────────────────────────────────────────────────

/** News article from Finnhub /company-news endpoint */
export interface NewsArticle {
  id: string
  headline: string
  summary: string
  url: string
  source: string
  datetime: number // unix timestamp
  image: string
}
