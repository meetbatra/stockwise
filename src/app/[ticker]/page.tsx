import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchQuote, fetchProfile } from '@/lib/finnhub'
import { PriceHeader } from '@/components/PriceHeader'
import { StockChart } from '@/components/StockChart'
import { StatsGrid } from '@/components/StatsGrid'
import { NewsPanel } from '@/components/NewsPanel'

type Props = {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const t = ticker.toUpperCase()
  const profile = await fetchProfile(t).catch(() => null)
  return {
    title: `${t} — ${profile?.name ?? ticker}`,
    description: `Real-time price, chart, and news for ${profile?.name ?? t} (${t}).`,
  }
}

export default async function TickerPage({ params }: Props) {
  const { ticker } = await params
  const t = ticker.toUpperCase()

  // Fetch server-side so the initial render is data-ready
  const [quoteResult, profileResult] = await Promise.allSettled([
    fetchQuote(t),
    fetchProfile(t),
  ])

  // If the quote fetch completely failed (bad ticker, network error), 404
  if (quoteResult.status === 'rejected') {
    notFound()
  }

  const quote = quoteResult.value
  const profile =
    profileResult.status === 'fulfilled' ? profileResult.value : null

  // Finnhub returns 0 for everything on unknown tickers
  if (quote.c === 0 && quote.o === 0) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-12 space-y-8 animate-fade-up">
      {/* Price Header — hydrates client-side for live polling */}
      <PriceHeader ticker={t} profile={profile} />

      {/* Main grid: chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — chart + stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <StockChart ticker={t} />
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <h2 className="text-sm font-medium text-slate-400 mb-4 tracking-wide">
              Key Statistics
            </h2>
            <StatsGrid quote={quote} profile={profile} />
          </div>
        </div>

        {/* Right column — news */}
        <div className="lg:col-span-1">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
            <NewsPanel ticker={t} />
          </div>
        </div>
      </div>
    </div>
  )
}
