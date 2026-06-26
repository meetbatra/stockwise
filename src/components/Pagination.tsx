'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  totalPages: number
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  // Always show first page
  pages.push(1)

  if (current > 4) pages.push('...')

  // Pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) pages.push('...')

  // Always show last page
  pages.push(total)

  return pages
}

export function Pagination({ totalPages }: PaginationProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false, history: 'push' }),
  )

  const currentPage = Math.max(1, Math.min(page, totalPages))
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return
    void setPage(p === 1 ? null : p)
  }

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 flex-wrap"
    >
      {/* Previous */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors',
          currentPage === 1
            ? 'text-on-surface-variant/40 cursor-not-allowed'
            : 'text-on-surface-variant hover:bg-border-active hover:text-primary',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center w-9 h-9 text-sm text-on-surface-variant/50 select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-ring/15 text-ring border border-ring/30'
                : 'text-on-surface-variant hover:bg-border-active hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors',
          currentPage === totalPages
            ? 'text-on-surface-variant/40 cursor-not-allowed'
            : 'text-on-surface-variant hover:bg-border-active hover:text-primary',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
