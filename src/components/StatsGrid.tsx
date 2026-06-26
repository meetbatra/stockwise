import { Globe, DollarSign, BarChart3 } from 'lucide-react'
import type { FullStockData } from '@/lib/yahoo-fetch'

interface StatsGridProps {
  meta: FullStockData
}

function fmt(n: number, digits = 2) {
  if (n === undefined || n === null) return 'N/A'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtVolume(n: number): string {
  if (n === undefined || n === null) return 'N/A'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return String(n)
}

import { Card, CardContent } from '@/components/ui/card'

export function StatsGrid({ meta }: StatsGridProps) {
  const stats = [
    {
      label: 'Last Price',
      value: `$${fmt(meta.price)}`,
      icon: DollarSign,
    },
    {
      label: "Day's High",
      value: `$${fmt(meta.dayHigh)}`,
      icon: DollarSign,
      positive: true,
    },
    {
      label: "Day's Low",
      value: `$${fmt(meta.dayLow)}`,
      icon: DollarSign,
      negative: true,
    },
    {
      label: 'Volume',
      value: fmtVolume(meta.volume),
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
      value: meta.exchange || 'N/A',
      icon: Globe,
    },
    {
      label: 'Currency',
      value: meta.currency || 'USD',
      icon: DollarSign,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, positive, negative }) => (
        <Card
          key={label}
          className="rounded-xl border-hairline bg-black/20 transition-colors hover:bg-black/40"
        >
          <CardContent className="p-4 space-y-1.5">
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

