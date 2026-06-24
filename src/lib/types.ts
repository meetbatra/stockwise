// ─── Finnhub API Response Types ──────────────────────────────────────────────

/** Real-time quote data from Finnhub /quote endpoint */
export interface Quote {
  /** Current price */
  c: number
  /** Change since previous close */
  d: number
  /** Percent change since previous close */
  dp: number
  /** High price of the day */
  h: number
  /** Low price of the day */
  l: number
  /** Open price of the day */
  o: number
  /** Previous close price */
  pc: number
  /** Timestamp of the last trade */
  t: number
}

/** Company profile from Finnhub /stock/profile2 endpoint */
export interface CompanyProfile {
  country: string
  currency: string
  exchange: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  finnhubIndustry: string
}

/** OHLCV candle data from Finnhub /stock/candle endpoint */
export interface Candles {
  /** Close prices */
  c: number[]
  /** High prices */
  h: number[]
  /** Low prices */
  l: number[]
  /** Open prices */
  o: number[]
  /** Timestamps (unix seconds) */
  t: number[]
  /** Volumes */
  v: number[]
  /** Status: "ok" | "no_data" */
  s: 'ok' | 'no_data'
}

/** Single news article from Finnhub /company-news endpoint */
export interface NewsArticle {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

// ─── Resolved / Normalised Types used inside the app ─────────────────────────

/** Normalised candle entry (one per data point) */
export interface CandlePoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** All data needed to render a full ticker page */
export interface TickerData {
  ticker: string
  quote: Quote
  profile: CompanyProfile | null
  candles: CandlePoint[]
  news: NewsArticle[]
}

// ─── API Route response shapes ────────────────────────────────────────────────

export interface ApiQuoteResponse {
  quote: Quote
}

export interface ApiProfileResponse {
  profile: CompanyProfile
}

export interface ApiCandlesResponse {
  candles: CandlePoint[]
}

export interface ApiNewsResponse {
  news: NewsArticle[]
}

export interface ApiErrorResponse {
  error: string
}
