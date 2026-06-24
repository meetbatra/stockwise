import type {
  Quote,
  CompanyProfile,
  Candles,
  CandlePoint,
  NewsArticle,
} from '@/lib/types'

const BASE_URL = 'https://finnhub.io/api/v1'

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key || key === 'your_api_key_here') {
    throw new Error(
      'FINNHUB_API_KEY is not set. Add it to .env.local and restart the dev server.',
    )
  }
  return key
}

/**
 * Thin fetch wrapper that appends the API token and throws on non-2xx.
 * Always called server-side (Route Handlers or RSC) so the key stays secret.
 */
async function finnhubFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const key = getApiKey()

  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('token', key)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    // Revalidate every 30 s in production; dev always fresh
    next: { revalidate: 30 },
  })

  if (!res.ok) {
    throw new Error(
      `Finnhub API error: ${res.status} ${res.statusText} — ${path}`,
    )
  }

  return res.json() as Promise<T>
}

// ─── Public helpers (called from Route Handlers) ──────────────────────────────

/** GET /quote — real-time bid/ask/last price */
export async function fetchQuote(ticker: string): Promise<Quote> {
  return finnhubFetch<Quote>('/quote', { symbol: ticker.toUpperCase() })
}

/** GET /stock/profile2 — company overview */
export async function fetchProfile(
  ticker: string,
): Promise<CompanyProfile | null> {
  try {
    const profile = await finnhubFetch<CompanyProfile>('/stock/profile2', {
      symbol: ticker.toUpperCase(),
    })
    // Finnhub returns {} for unknown tickers
    if (!profile || !profile.name) return null
    return profile
  } catch {
    return null
  }
}

/** GET /stock/candle — OHLCV history, normalised to CandlePoint[] (now using Yahoo Finance to bypass Finnhub free tier limits) */
export async function fetchCandles(
  ticker: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M' = 'D',
  fromUnix?: number,
  toUnix?: number,
): Promise<CandlePoint[]> {
  const now = toUnix ?? Math.floor(Date.now() / 1000)
  // Default: last 90 trading days ≈ ~130 calendar days
  const from = fromUnix ?? now - 130 * 24 * 60 * 60

  // Map Finnhub resolutions to Yahoo Finance intervals
  const intervalMap: Record<string, string> = {
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '60m',
    D: '1d',
    W: '1wk',
    M: '1mo',
  }
  const interval = intervalMap[resolution] ?? '1d'

  const yahooTicker = ticker.toUpperCase().replace('.', '-')
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?period1=${from}&period2=${now}&interval=${interval}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 30 },
    })

    if (!res.ok) return []

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return []
    }

    const timestamps = result.timestamp as number[]
    const quote = result.indicators.quote[0]

    return timestamps.map((time, i) => ({
      time,
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    }))
  } catch {
    return []
  }
}

/** GET /company-news — recent news articles */
export async function fetchNews(
  ticker: string,
  limit = 10,
): Promise<NewsArticle[]> {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)

  const fmt = (d: Date) => d.toISOString().slice(0, 10) // YYYY-MM-DD

  const articles = await finnhubFetch<NewsArticle[]>('/company-news', {
    symbol: ticker.toUpperCase(),
    from: fmt(from),
    to: fmt(to),
  })

  return Array.isArray(articles) ? articles.slice(0, limit) : []
}
