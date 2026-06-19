import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  paused: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-brand-primary-100 text-brand-primary-800 border-brand-primary-200',
  cancelled: 'bg-brand-primary-100 text-brand-primary-800 border-brand-primary-200',
}

const STATUS_LABELS: Record<string, string> = {
  paused: 'Paused',
  pending: 'Pending',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  success: 'Success',
}

interface StatusChipProps {
  status: string
  icon?: LucideIcon
  className?: string
}

export function StatusChip({ status, icon: Icon, className }: StatusChipProps) {
  const style = STATUS_STYLES[status] ?? 'bg-brand-neutral-100 text-brand-neutral-600 border-brand-neutral-200'
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border capitalize',
        style,
        className,
      )}
    >
      {Icon ? (
        <Icon className="w-3.5 h-3.5" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
      )}
      {label}
    </span>
  )
}
