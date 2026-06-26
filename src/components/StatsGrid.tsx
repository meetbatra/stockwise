import { Globe, DollarSign, BarChart3 } from 'lucide-react'
import type { YahooMeta } from '@/lib/types'

interface StatsGridProps {
  meta: YahooMeta
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtVolume(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return String(n)
}

export function StatsGrid({ meta }: StatsGridProps) {
  const stats = [
    {
      label: 'Open',
      value: `$${fmt(meta.regularMarketPrice)}`,
      icon: DollarSign,
    },
    {
      label: "Day's High",
      value: `$${fmt(meta.regularMarketDayHigh)}`,
      icon: DollarSign,
      positive: true,
    },
    {
      label: "Day's Low",
      value: `$${fmt(meta.regularMarketDayLow)}`,
      icon: DollarSign,
      negative: true,
    },
    {
      label: 'Volume',
      value: fmtVolume(meta.regularMarketVolume),
      icon: BarChart3,
    },
    {
      label: '52W High',
      value: `$${fmt(meta.fiftyTwoWeekHigh)}`,
      icon: DollarSign,
      positive: true,
    },
    {
      label: '52W Low',
      value: `$${fmt(meta.fiftyTwoWeekLow)}`,
      icon: DollarSign,
      negative: true,
    },
    {
      label: 'Exchange',
      value: meta.exchangeName,
      icon: Globe,
    },
    {
      label: 'Currency',
      value: meta.currency,
      icon: DollarSign,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, positive, negative }) => (
        <div
          key={label}
          className="rounded-xl border border-hairline bg-black/20 p-4 transition-colors hover:bg-black/40"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p
              className={[
                'text-lg font-mono font-medium truncate',
                positive ? 'text-emerald-400' : '',
                negative ? 'text-rose-400' : 'text-slate-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
