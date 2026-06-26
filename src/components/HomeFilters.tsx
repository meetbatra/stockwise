'use client'

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'
import { Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SECTORS } from '@/lib/tickers'
import { useDebounce } from '@/hooks/use-debounce'
import { useState, useEffect } from 'react'

interface HomeFiltersProps {
  resultCount: number
}

export function HomeFilters({ resultCount }: HomeFiltersProps) {
  const [, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  )
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: false }),
  )
  const [sector, setSector] = useQueryState(
    'sector',
    parseAsString.withDefault('').withOptions({ shallow: false }),
  )

  // Local input state so typing feels instant; debounced value updates URL
  const [localSearch, setLocalSearch] = useState(search ?? '')
  const debouncedSearch = useDebounce(localSearch, 300)

  useEffect(() => {
    if (debouncedSearch !== (search ?? '')) {
      void setSearch(debouncedSearch || null)
      void setPage(null) // reset to page 1
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleSectorChange = (value: string | null) => {
    if (!value) return
    void setSector(value === 'all' ? null : value)
    void setPage(null)
  }

  const clearFilters = () => {
    setLocalSearch('')
    void setSearch(null)
    void setSector(null)
    void setPage(null)
  }

  const hasActiveFilter = Boolean(search || sector)

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 min-w-0 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search stocks..."
          aria-label="Search stocks by ticker or name"
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-card border border-border-hairline text-sm text-primary placeholder:text-on-surface-variant focus:outline-none focus:border-ring/50 focus:ring-1 focus:ring-ring/30 transition-colors"
        />
      </div>

      {/* Sector dropdown */}
      <Select
        value={sector || 'all'}
        onValueChange={handleSectorChange}
      >
        <SelectTrigger className="w-full sm:w-[180px] h-9 bg-surface-card border-border-hairline text-sm text-primary focus:ring-ring/30">
          <SelectValue placeholder="All Sectors" />
        </SelectTrigger>
        <SelectContent className="bg-surface-card border-border-hairline">
          <SelectItem value="all" className="text-sm text-on-surface-variant">
            All Sectors
          </SelectItem>
          {SECTORS.map((s) => (
            <SelectItem key={s} value={s} className="text-sm">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Results count + clear */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            aria-label="Clear all filters"
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
        <span className="font-label-caps text-[11px] tracking-wider uppercase text-on-surface-variant whitespace-nowrap">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
