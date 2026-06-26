/**
 * Supported tickers in Stockwise with sector metadata.
 * Extend this list to add more symbols to the dashboard.
 */
export interface TickerEntry {
  ticker: string
  sector: string
}

export const SUPPORTED_TICKERS: TickerEntry[] = [
  { ticker: 'AAPL',  sector: 'Technology' },
  { ticker: 'MSFT',  sector: 'Technology' },
  { ticker: 'NVDA',  sector: 'Technology' },
  { ticker: 'GOOGL', sector: 'Technology' },
  { ticker: 'META',  sector: 'Technology' },
  { ticker: 'TSLA',  sector: 'Consumer Cyclical' },
  { ticker: 'AMZN',  sector: 'Consumer Cyclical' },
  { ticker: 'AMD',   sector: 'Technology' },
  { ticker: 'INTC',  sector: 'Technology' },
  { ticker: 'ORCL',  sector: 'Technology' },
  { ticker: 'CRM',   sector: 'Technology' },
  { ticker: 'ADBE',  sector: 'Technology' },
  { ticker: 'NFLX',  sector: 'Consumer Cyclical' },
  { ticker: 'UBER',  sector: 'Technology' },
  { ticker: 'SHOP',  sector: 'Technology' },
  { ticker: 'PYPL',  sector: 'Financial Services' },
  { ticker: 'V',     sector: 'Financial Services' },
  { ticker: 'MA',    sector: 'Financial Services' },
  { ticker: 'JPM',   sector: 'Financial Services' },
  { ticker: 'GS',    sector: 'Financial Services' },
  { ticker: 'BAC',   sector: 'Financial Services' },
  { ticker: 'BRK-B', sector: 'Financial Services' },
  { ticker: 'WFC',   sector: 'Financial Services' },
  { ticker: 'AXP',   sector: 'Financial Services' },
  { ticker: 'JNJ',   sector: 'Healthcare' },
  { ticker: 'UNH',   sector: 'Healthcare' },
  { ticker: 'PFE',   sector: 'Healthcare' },
  { ticker: 'ABBV',  sector: 'Healthcare' },
  { ticker: 'MRK',   sector: 'Healthcare' },
  { ticker: 'XOM',   sector: 'Energy' },
  { ticker: 'CVX',   sector: 'Energy' },
  { ticker: 'COP',   sector: 'Energy' },
  { ticker: 'WMT',   sector: 'Consumer Defensive' },
  { ticker: 'PG',    sector: 'Consumer Defensive' },
  { ticker: 'KO',    sector: 'Consumer Defensive' },
  { ticker: 'PEP',   sector: 'Consumer Defensive' },
  { ticker: 'COST',  sector: 'Consumer Defensive' },
  { ticker: 'MCD',   sector: 'Consumer Defensive' },
  { ticker: 'NKE',   sector: 'Consumer Cyclical' },
  { ticker: 'DIS',   sector: 'Communication Services' },
  { ticker: 'CMCSA', sector: 'Communication Services' },
  { ticker: 'T',     sector: 'Communication Services' },
  { ticker: 'VZ',    sector: 'Communication Services' },
  { ticker: 'NEE',   sector: 'Utilities' },
  { ticker: 'LIN',   sector: 'Basic Materials' },
  { ticker: 'HON',   sector: 'Industrials' },
  { ticker: 'CAT',   sector: 'Industrials' },
  { ticker: 'BA',    sector: 'Industrials' },
  { ticker: 'GE',    sector: 'Industrials' },
  { ticker: 'RTX',   sector: 'Industrials' },
]

/** Unique sector names derived from SUPPORTED_TICKERS */
export const SECTORS: string[] = Array.from(
  new Set(SUPPORTED_TICKERS.map((t) => t.sector)),
)

/**
 * Returns true if the given string matches any supported ticker symbol.
 */
export function isSupportedTicker(ticker: string): boolean {
  return SUPPORTED_TICKERS.some(
    (t) => t.ticker.toUpperCase() === ticker.toUpperCase(),
  )
}

/**
 * Human-readable display name. Falls back to the ticker symbol itself.
 * With Yahoo Finance, longName is available from the meta — this is a
 * lightweight fallback for contexts where we don't have API data.
 */
export function getDisplayName(ticker: string): string {
  return ticker.toUpperCase()
}
