import { Building2, Globe, DollarSign, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CompanyProfile, Quote } from '@/lib/types'

interface StatsGridProps {
  quote: Quote
  profile: CompanyProfile | null
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtLarge(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}T`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}B`
  return `$${n.toFixed(2)}M`
}

export function StatsGrid({ quote, profile }: StatsGridProps) {
  const stats = [
    {
      label: 'Market Cap',
      value: profile?.marketCapitalization
        ? fmtLarge(profile.marketCapitalization)
        : '—',
      icon: BarChart3,
    },
    {
      label: 'Open',
      value: `$${fmt(quote.o)}`,
      icon: DollarSign,
    },
    {
      label: "Day's High",
      value: `$${fmt(quote.h)}`,
      icon: DollarSign,
      positive: true,
    },
    {
      label: "Day's Low",
      value: `$${fmt(quote.l)}`,
      icon: DollarSign,
      negative: true,
    },
    {
      label: 'Industry',
      value: profile?.finnhubIndustry ?? '—',
      icon: Building2,
    },
    {
      label: 'Exchange',
      value: profile?.exchange?.split(' ')[0] ?? '—',
      icon: Globe,
    },
    {
      label: 'Shares Out.',
      value: profile?.shareOutstanding
        ? `${(profile.shareOutstanding / 1000).toFixed(2)}B`
        : '—',
      icon: BarChart3,
    },
    {
      label: 'IPO Date',
      value: profile?.ipo ?? '—',
      icon: Building2,
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

      {/* Website link */}
      {profile?.weburl && (
        <div className="col-span-2 sm:col-span-4 rounded-xl border border-hairline bg-black/20 p-4 flex items-center gap-2 transition-colors hover:bg-black/40">
          <Globe className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Website</span>
          <a
            href={profile.weburl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline truncate ml-1 font-mono"
          >
            {profile.weburl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
          <Badge variant="outline" className="ml-auto text-[10px] shrink-0 border-hairline bg-black/20 text-slate-300">
            {profile.country}
          </Badge>
        </div>
      )}
    </div>
  )
}
