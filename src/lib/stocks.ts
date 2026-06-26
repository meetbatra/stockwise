import { fetchChartMeta } from '@/lib/yahoo'
import { SUPPORTED_TICKERS, type TickerEntry } from '@/lib/tickers'
import type { YahooMeta } from '@/lib/types'

export const PAGE_SIZE = 10

export interface PageStock {
  ticker: string
  sector: string
  meta: YahooMeta | null
}

/**
 * Fetches market data for a list of tickers in parallel.
 * Uses Promise.allSettled so one failed ticker never breaks the whole page.
 */
export async function fetchPageStocks(
  entries: TickerEntry[],
): Promise<PageStock[]> {
  const results = await Promise.allSettled(
    entries.map((e) => fetchChartMeta(e.ticker)),
  )

  return entries.map((entry, i) => {
    const result = results[i]!
    return {
      ticker: entry.ticker,
      sector: entry.sector,
      meta: result.status === 'fulfilled' ? result.value : null,
    }
  })
}

/**
 * Returns the total number of pages for the full ticker list.
 */
export function getTotalPages(list: TickerEntry[] = SUPPORTED_TICKERS): number {
  return Math.ceil(list.length / PAGE_SIZE)
}

/**
 * Returns the slice of tickers for a given 1-indexed page.
 * Clamps out-of-range pages to valid bounds.
 */
export function getPaginatedTickers(
  page: number,
  list: TickerEntry[] = SUPPORTED_TICKERS,
): TickerEntry[] {
  const totalPages = getTotalPages(list)
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
}
