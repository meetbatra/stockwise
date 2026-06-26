import ky from 'ky'
import type { YahooMeta, CandlePoint } from '@/lib/types'

const yahoo = ky.create({
  prefix: 'https://query1.finance.yahoo.com',
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
})

/**
 * Fetches the meta object for a ticker from the Yahoo Finance chart endpoint.
 * Used by home page cards AND detail page stats.
 */
export async function fetchChartMeta(ticker: string): Promise<YahooMeta> {
  const t = ticker.toUpperCase().replace('.', '-')

  const data = await yahoo
    .get(`v8/finance/chart/${t}`, {
      searchParams: {
        range: '1d',
        interval: '1d',
      },
    })
    .json<{ chart: { result: Array<{ meta: YahooMeta }> } }>()

  const meta = data?.chart?.result?.[0]?.meta
  if (!meta) {
    throw new Error(`No chart data returned for ${ticker}`)
  }

  return meta
}

/**
 * Fetches OHLCV candle data for a ticker from the Yahoo Finance chart endpoint.
 * Used by the detail page chart.
 */
export async function fetchCandles(
  ticker: string,
  from: number,
  to: number,
  interval: string,
): Promise<CandlePoint[]> {
  const t = ticker.toUpperCase().replace('.', '-')

  try {
    const data = await yahoo
      .get(`v8/finance/chart/${t}`, {
        searchParams: {
          period1: String(from),
          period2: String(to),
          interval: interval,
        },
      })
      .json<{
        chart: {
          result: Array<{
            timestamp: number[]
            indicators: {
              quote: Array<{
                open: number[]
                high: number[]
                low: number[]
                close: number[]
                volume: number[]
              }>
            }
          }>
        }
      }>()

    const result = data?.chart?.result?.[0]
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return []
    }

    const timestamps = result.timestamp
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

export { yahoo }
