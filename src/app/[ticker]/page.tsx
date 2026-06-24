import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchQuote, fetchProfile } from '@/lib/finnhub'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      {/* Price Header — hydrates client-side for live polling */}
      <PriceHeader ticker={t} profile={profile} />

      <Separator className="bg-border/50" />

      {/* Main grid: chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — chart + stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-5">
              <StockChart ticker={t} />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                Key Statistics
              </h2>
              <StatsGrid quote={quote} profile={profile} />
            </CardContent>
          </Card>
        </div>

        {/* Right column — news */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-card/60 h-full">
            <CardContent className="p-5">
              <NewsPanel ticker={t} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
