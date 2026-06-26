import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchQuote, fetchCandles } from '@/lib/yahoo-fetch'
import { fetchNews } from '@/lib/finnhub'
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
  return {
    title: `${t} | Stockwise`,
    description: `Real-time price, chart, and news for ${t}.`,
  }
}

export default async function TickerPage({ params }: Props) {
  const { ticker } = await params
  const t = ticker.toUpperCase()

  let meta
  let initialCandles
  let initialWeeklyCandles
  let initialNews
  try {
    const now = Math.floor(Date.now() / 1000)
    const fetchFrom = now - 365 * 86400
    const fetchWeeklyFrom = now - 7 * 86400
    
    // Fetch all initial data in parallel so the page stays in the loading.tsx skeleton until EVERYTHING is ready
    const [quoteData, candlesData, weeklyCandlesData, newsData] = await Promise.all([
      fetchQuote(t),
      fetchCandles(t, fetchFrom, now, '1d'),
      fetchCandles(t, fetchWeeklyFrom, now, '60m'),
      fetchNews(t)
    ])
    
    meta = quoteData
    initialCandles = candlesData
    initialWeeklyCandles = weeklyCandlesData
    initialNews = newsData
  } catch {
    notFound()
  }

  // Yahoo returns 0 for price on unknown tickers
  if (!meta || meta.price === 0) {
    notFound()
  }

  const hasApiKey = Boolean(process.env.FINNHUB_API_KEY)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-12 space-y-8 animate-fade-up">
      {/* Price Header — hydrates client-side for live polling */}
      <PriceHeader ticker={t} initialQuote={meta} />

      {/* Main grid: chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — chart + stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <StockChart ticker={t} initialCandles={initialCandles} initialWeeklyCandles={initialWeeklyCandles} />
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <h2 className="text-sm font-medium text-slate-400 mb-4 tracking-wide">
              Key Statistics
            </h2>
            <StatsGrid meta={meta} />
          </div>
        </div>

        {/* Right column — news */}
        <div className="lg:col-span-1">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
            <NewsPanel ticker={t} hasApiKey={hasApiKey} initialNews={initialNews} />
          </div>
        </div>
      </div>
    </div>
  )
}
