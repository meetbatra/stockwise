import { getAuth, invalidateAuth } from './yahoo-auth'
import type { CandlePoint } from '@/lib/types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  dayHigh: number
  dayLow: number
  currency: string
  exchange: string
}

export interface FullStockData extends StockData {
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  trailingPE: number | null
  dividendYield: number | null
  averageDailyVolume3Month: number
  earningsTimestamp: number | null
  longName: string
}

async function fetchWithAuth(url: URL) {
  let { cookie, crumb } = await getAuth()
  url.searchParams.set('crumb', crumb)

  let res = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: cookie,
    },
  })

  // If unauthorized, invalidate cache and retry once
  if (res.status === 401 || res.status === 403) {
    invalidateAuth()
    ;({ cookie, crumb } = await getAuth())
    url.searchParams.set('crumb', crumb)
    
    res = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Cookie: cookie,
      },
    })
  }

  if (!res.ok) {
    throw new Error(`Yahoo API returned ${res.status}: ${res.statusText}`)
  }

  return res.json()
}

function formatExchange(exchange: string | undefined): string {
  if (!exchange) return 'N/A'
  const upper = exchange.toUpperCase()
  if (upper.includes('NASDAQ') || upper === 'NMS' || upper === 'NCM' || upper === 'NGM') return 'NASDAQ'
  if (upper.includes('NYSE') || upper === 'NYQ') return 'NYSE'
  if (upper.includes('BATS')) return 'BATS'
  if (upper.includes('AMEX') || upper === 'ASE') return 'AMEX'
  if (upper === 'PNK' || upper.includes('OTC')) return 'OTC'
  return exchange
}

export async function fetchScreener(screenerId: string, size: number = 50): Promise<StockData[]> {
  const url = new URL('https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved')
  url.searchParams.set('scrIds', screenerId)
  url.searchParams.set('count', size.toString())
  url.searchParams.set('lang', 'en-US')
  url.searchParams.set('region', 'US')
  url.searchParams.set('formatted', 'false')

  const json = await fetchWithAuth(url)
  const quotes = json?.finance?.result?.[0]?.quotes

  if (!Array.isArray(quotes)) {
    return []
  }

  return quotes.map((q: Record<string, unknown>) => ({
    symbol: String(q.symbol || ''),
    name: String(q.shortName || q.longName || q.symbol || ''),
    price: Number(q.regularMarketPrice ?? 0),
    change: Number(q.regularMarketChange ?? 0),
    changePercent: Number(q.regularMarketChangePercent ?? 0),
    volume: Number(q.regularMarketVolume ?? 0),
    marketCap: Number(q.marketCap ?? 0),
    dayHigh: Number(q.regularMarketDayHigh ?? 0),
    dayLow: Number(q.regularMarketDayLow ?? 0),
    currency: String(q.currency ?? 'USD'),
    exchange: formatExchange(String(q.fullExchangeName || q.exchange || '')),
  }))
}

export async function fetchQuote(symbol: string): Promise<FullStockData | null> {
  const url = new URL('https://query1.finance.yahoo.com/v7/finance/quote')
  url.searchParams.set('symbols', symbol)
  url.searchParams.set('formatted', 'false')
  url.searchParams.set('lang', 'en-US')
  url.searchParams.set('region', 'US')

  const json = await fetchWithAuth(url)
  const q = json?.quoteResponse?.result?.[0]

  if (!q) {
    return null
  }

  return {
    symbol: q.symbol,
    name: q.shortName || q.longName || q.symbol,
    price: q.regularMarketPrice ?? 0,
    change: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
    volume: q.regularMarketVolume ?? 0,
    marketCap: q.marketCap ?? 0,
    dayHigh: q.regularMarketDayHigh ?? 0,
    dayLow: q.regularMarketDayLow ?? 0,
    currency: q.currency ?? 'USD',
    exchange: formatExchange(String(q.fullExchangeName || q.exchange || '')),
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? 0,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? 0,
    trailingPE: q.trailingPE ?? null,
    dividendYield: q.dividendYield ?? null,
    averageDailyVolume3Month: q.averageDailyVolume3Month ?? 0,
    earningsTimestamp: q.earningsTimestamp ?? null,
    longName: q.longName ?? q.shortName ?? q.symbol,
  }
}

export async function fetchCandles(
  ticker: string,
  from: number,
  to: number,
  interval: string,
): Promise<CandlePoint[]> {
  const t = ticker.toUpperCase().replace('.', '-')
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${t}`)
  url.searchParams.set('period1', String(from))
  url.searchParams.set('period2', String(to))
  url.searchParams.set('interval', interval)

  try {
    const json = await fetchWithAuth(url)
    const result = json?.chart?.result?.[0]
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return []
    }

    const timestamps = result.timestamp as number[]
    const quote = result.indicators.quote[0] as {
      open: number[]
      high: number[]
      low: number[]
      close: number[]
      volume: number[]
    }

    return timestamps.map((time, i) => ({
      time,
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    }))
  } catch (error) {
    console.error(`Failed to fetch candles for ${ticker}:`, error)
    return []
  }
}
