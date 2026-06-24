import type { Metadata } from 'next'

type Props = {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  return {
    title: `${ticker.toUpperCase()} — Stockwise`,
  }
}

export default async function TickerPage({ params }: Props) {
  const { ticker } = await params
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {ticker.toUpperCase()} — Coming Soon
      </h1>
    </div>
  )
}
