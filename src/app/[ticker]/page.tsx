import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchChartMeta } from '@/lib/yahoo'
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
  try {
    meta = await fetchChartMeta(t)
  } catch {
    notFound()
  }

  // Yahoo returns 0 for price on unknown tickers
  if (!meta || meta.regularMarketPrice === 0) {
    notFound()
  }

  const hasApiKey = Boolean(process.env.FINNHUB_API_KEY)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-12 space-y-8 animate-fade-up">
      {/* Price Header — hydrates client-side for live polling */}
      <PriceHeader ticker={t} />

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
            <StatsGrid meta={meta} />
          </div>
        </div>

        {/* Right column — news */}
        <div className="lg:col-span-1">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#111827] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
            <NewsPanel ticker={t} hasApiKey={hasApiKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
