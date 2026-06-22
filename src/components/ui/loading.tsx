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
