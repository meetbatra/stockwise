'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StockPaginationProps {
  page: number
  totalPages: number
  loading?: boolean
  onPageChange: (page: number) => void
}

export function StockPagination({ page, totalPages, loading = false, onPageChange }: StockPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-4 animate-fade-up">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
        aria-label="Go to previous page"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-sm text-on-surface-variant hover:bg-border-active hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={loading}
                aria-label={`Go to page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  page === p
                    ? 'bg-ring/15 text-ring border border-ring/30'
                    : 'text-on-surface-variant hover:bg-border-active hover:text-primary'
                }`}
              >
                {p}
              </button>
            )
          } else if (p === page - 2 || p === page + 2) {
            return (
              <span
                key={p}
                aria-hidden="true"
                className="flex items-center justify-center w-9 h-9 text-sm text-on-surface-variant/50"
              >
                ...
              </span>
            )
          }
          return null
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || loading}
        aria-label="Go to next page"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-sm text-on-surface-variant hover:bg-border-active hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
