'use client'

export const SCREENERS = [
  { id: 'most_actives', label: 'Most Actives' },
  { id: 'day_gainers', label: 'Day Gainers' },
  { id: 'day_losers', label: 'Day Losers' },
  { id: 'undervalued_large_caps', label: 'Value (Large)' },
  { id: 'growth_technology_stocks', label: 'Tech Growth' },
  { id: 'undervalued_growth_stocks', label: 'Value Growth' },
  { id: 'small_cap_gainers', label: 'Small Cap Gainers' },
] as const

interface ScreenerFilterProps {
  activeScreener: string
  onScreenerChange: (id: string) => void
}

import { Button } from '@/components/ui/button'

export function ScreenerFilter({ activeScreener, onScreenerChange }: ScreenerFilterProps) {
  return (
    <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-none animate-fade-up">
      {SCREENERS.map((s) => (
        <Button
          key={s.id}
          onClick={() => onScreenerChange(s.id)}
          aria-pressed={activeScreener === s.id}
          variant={activeScreener === s.id ? 'default' : 'outline'}
          className={`rounded-full ${
            activeScreener === s.id
              ? ''
              : 'bg-surface-card text-on-surface-variant hover:text-primary hover:border-border-active border-border-hairline'
          }`}
        >
          {s.label}
        </Button>
      ))}
    </section>
  )
}
