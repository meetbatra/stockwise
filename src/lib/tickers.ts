/**
 * Supported tickers in Stockwise.
 * Extend this list to add more symbols to the dashboard.
 */
export const SUPPORTED_TICKERS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'META',
  'TSLA',
  'BRK.B',
  'JPM',
  'V',
] as const

export type SupportedTicker = (typeof SUPPORTED_TICKERS)[number]

/**
 * Returns true if the given string is in the SUPPORTED_TICKERS list.
 * Use this to validate route params before hitting the Finnhub API.
 */
export function isSupportedTicker(
  ticker: string,
): ticker is SupportedTicker {
  return (SUPPORTED_TICKERS as readonly string[]).includes(
    ticker.toUpperCase(),
  )
}

/**
 * Human-readable display name for well-known tickers.
 * Falls back to the ticker symbol itself for unlisted ones.
 */
const DISPLAY_NAMES: Partial<Record<string, string>> = {
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  AMZN: 'Amazon',
  NVDA: 'NVIDIA',
  META: 'Meta Platforms',
  TSLA: 'Tesla',
  'BRK.B': 'Berkshire Hathaway',
  JPM: 'JPMorgan Chase',
  V: 'Visa',
}

export function getDisplayName(ticker: string): string {
  return DISPLAY_NAMES[ticker.toUpperCase()] ?? ticker.toUpperCase()
}
