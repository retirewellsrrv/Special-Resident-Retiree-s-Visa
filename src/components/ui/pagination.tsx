'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  perPage: number
  onChange: (page: number) => void
  maxVisiblePages?: number
  showInfo?: boolean
  disabled?: boolean
}

export function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onChange,
  maxVisiblePages = 0,
  showInfo = true,
  disabled = false,
}: PaginationProps) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const visiblePages = maxVisiblePages > 0
    ? Array.from({ length: Math.min(totalPages, maxVisiblePages) }, (_, i) => i + 1)
    : Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {showInfo ? (
        <span className="text-xs text-muted-foreground">
          {total === 0
            ? 'No records'
            : `Showing ${start}\u2013${end} of ${total.toLocaleString()} records`}
        </span>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1 || disabled}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-input text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            disabled={disabled}
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-colors ${
              p === page
                ? 'bg-primary text-primary-foreground disabled:opacity-50'
                : 'border border-input text-muted-foreground hover:bg-accent disabled:opacity-30'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages || disabled}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-input text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
