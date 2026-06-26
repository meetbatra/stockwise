import { type Metadata } from 'next'
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'
import { SUPPORTED_TICKERS } from '@/lib/tickers'
import { fetchPageStocks, getPaginatedTickers, getTotalPages, PAGE_SIZE } from '@/lib/stocks'
import { StockCard } from '@/components/StockCard'
import { Pagination } from '@/components/Pagination'
import { HomeFilters } from '@/components/HomeFilters'

export const metadata: Metadata = {
  title: 'Stockwise — Stock Analytics Dashboard',
  description:
    'Real-time market overview for top US equities. Click any card for the full analysis.',
}

// No segment-level revalidate — ky handles requests without Next.js cache
const loadSearchParams = createLoader({
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  sector: parseAsString.withDefault(''),
})

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { page, search, sector } = loadSearchParams(await searchParams)

  // Filter the full ticker list based on active search/sector filters
  const filteredList = SUPPORTED_TICKERS.filter((entry) => {
    const matchesSector = !sector || entry.sector === sector
    const matchesSearch =
      !search ||
      entry.ticker.toLowerCase().includes(search.toLowerCase())
    return matchesSector && matchesSearch
  })

  const totalPages = getTotalPages(filteredList)
  const pageTickers = getPaginatedTickers(page, filteredList)

  // Fetch all stocks for the current page in one parallel batch
  const stocks = await fetchPageStocks(pageTickers)

  return (
    <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2 animate-fade-up">
        <h1 className="font-headline-lg text-3xl md:text-4xl text-primary tracking-tight font-semibold">
          Market Overview
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant">
          Real-time institutional grade data visualization.
        </p>
      </section>

      {/* Filters */}
      <HomeFilters resultCount={filteredList.length} />

      {/* Stock grid — all cards load at the same time */}
      {stocks.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-up">
          {stocks.map(({ ticker, sector: s, meta }) => (
            <StockCard key={ticker} ticker={ticker} sector={s} meta={meta} />
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-up">
          <p className="font-body-md text-on-surface-variant">
            No stocks match your filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination totalPages={totalPages} />
      )}

      {/* Footer */}
      <p className="text-[11px] text-on-surface-variant text-center pt-2">
        Data via{' '}
        <a
          href="https://finance.yahoo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          Yahoo Finance
        </a>
        {' '}· Showing {PAGE_SIZE} per page
      </p>
    </div>
  )
}
