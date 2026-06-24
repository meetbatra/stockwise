import { Building2, Globe, DollarSign, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, positive, negative }) => (
        <Card
          key={label}
          className="border-border/50 bg-card/60 animate-fade-up"
        >
          <CardContent className="p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs">{label}</span>
            </div>
            <p
              className={[
                'text-sm font-semibold tabular-nums truncate',
                positive ? 'text-emerald-400' : '',
                negative ? 'text-rose-400' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {value}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Website link */}
      {profile?.weburl && (
        <Card className="border-border/50 bg-card/60 col-span-2 sm:col-span-4 animate-fade-up">
          <CardContent className="p-3.5 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Website</span>
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:underline truncate ml-1"
            >
              {profile.weburl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
            <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
              {profile.country}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
