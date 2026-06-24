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

/** GET /stock/candle — OHLCV history, normalised to CandlePoint[] */
export async function fetchCandles(
  ticker: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M' = 'D',
  fromUnix?: number,
  toUnix?: number,
): Promise<CandlePoint[]> {
  const now = toUnix ?? Math.floor(Date.now() / 1000)
  // Default: last 90 trading days ≈ ~130 calendar days
  const from = fromUnix ?? now - 130 * 24 * 60 * 60

  const raw = await finnhubFetch<Candles>('/stock/candle', {
    symbol: ticker.toUpperCase(),
    resolution,
    from: String(from),
    to: String(now),
  })

  if (raw.s !== 'ok' || !raw.t?.length) return []

  const o = raw.o as number[]
  const h = raw.h as number[]
  const l = raw.l as number[]
  const c = raw.c as number[]
  const v = raw.v as number[]

  return raw.t.map((time, i) => ({
    time,
    open: (raw.o[i] as number),
    high: (raw.h[i] as number),
    low: (raw.l[i] as number),
    close: (raw.c[i] as number),
    volume: (raw.v[i] as number),
  }))
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
