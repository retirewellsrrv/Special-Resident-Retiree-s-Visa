import { Loader2 } from 'lucide-react'
import { Skeleton } from './skeleton'

interface LoadingSpinnerProps {
  message?: string
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12 bg-white border border-brand-neutral-200 rounded-xl text-sm text-brand-neutral-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {message}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  const colWidths = ['w-32', 'w-24', 'w-20', 'w-20', 'w-28']

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="py-4 pr-4">
              <Skeleton className={`h-3.5 ${colWidths[j % colWidths.length]}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface CardListSkeletonProps {
  rows?: number
}

/**
 * Div-based skeleton for mobile card lists. Unlike TableSkeleton this renders
 * <div> cards (NOT <tr>/<td>), so it can live inside a plain container without
 * causing hydration errors.
 */
export function CardListSkeleton({ rows = 5 }: CardListSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden"
          aria-hidden
        >
          <div className="px-4 py-3 flex items-center gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full shrink-0" />
          </div>
          <div className="px-4 py-2 border-t border-brand-neutral-100 bg-brand-neutral-50/40 flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </>
  )
}
