import Link from 'next/link'
import type { YahooMeta } from '@/lib/types'

interface StockCardProps {
  ticker: string
  sector: string
  meta: YahooMeta | null
}

function formatCompact(n: number): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

export function StockCard({ ticker, sector, meta }: StockCardProps) {
  if (!meta) {
    return (
      <Link href={`/${ticker}`} className="group block">
        <article className="bg-surface-card border border-border-hairline rounded-lg hover:border-border-active transition-colors flex flex-col h-full min-h-[170px] opacity-60">
          <div className="p-[20px] flex flex-col gap-2 flex-grow justify-center items-center text-center">
            <span className="font-label-caps text-xs tracking-widest uppercase text-primary">
              {ticker}
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Data unavailable
            </p>
          </div>
        </article>
      </Link>
    )
  }

  const price = meta.regularMarketPrice
  const prevClose = meta.chartPreviousClose
  const changePct = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0
  const isUp = changePct > 0
  const isDown = changePct < 0

  const trendColorClass = isUp
    ? 'text-trend-up'
    : isDown
      ? 'text-trend-down'
      : 'text-on-surface-variant'

  const sign = changePct > 0 ? '+' : ''
  const formattedChange = `${sign}${changePct.toFixed(2)}%`
  const arrow = isUp ? '▲' : isDown ? '▼' : '—'

  return (
    <Link href={`/${ticker}`} className="group block">
      <article className="bg-surface-card border border-border-hairline rounded-lg hover:border-border-active transition-colors flex flex-col h-full hover:shadow-lg hover:shadow-primary/5">
        {/* Top: ticker + name + change */}
        <div className="p-[20px] flex justify-between items-start gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-caps text-xs tracking-widest uppercase text-primary shrink-0">
                {ticker}
              </span>
              <span className="font-body-sm text-[10px] text-on-surface-variant bg-border-active/60 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {sector}
              </span>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant truncate max-w-[140px] mt-1">
              {meta.longName}
            </p>
          </div>
          <span className={`font-data-mono text-sm shrink-0 ${trendColorClass}`}>
            {arrow} {formattedChange}
          </span>
        </div>

        {/* Middle: price */}
        <div className="px-[20px] pb-[20px] flex-grow">
          <span className="font-data-mono text-[24px] font-bold text-primary tracking-tight">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Bottom: day high + volume */}
        <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">
              HIGH
            </span>
            <span className="font-data-mono text-sm text-primary mt-1">
              {meta.regularMarketDayHigh.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface-variant">
              VOL
            </span>
            <span className="font-data-mono text-sm text-primary mt-1">
              {formatCompact(meta.regularMarketVolume)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
