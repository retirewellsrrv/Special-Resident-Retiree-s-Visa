import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatCardProps {
  icon: LucideIcon
  iconBgClass?: string
  iconColorClass?: string
  label: string
  value: string | number
  badge?: string
  badgeVariant?: 'default' | 'destructive' | 'secondary'
  highlight?: boolean
  barWidth?: number
  barColor?: string
  footer?: React.ReactNode
  onClick?: () => void
  active?: boolean
}

export function StatCard({
  icon: Icon,
  iconBgClass = 'bg-brand-primary-50',
  iconColorClass = 'text-brand-primary-600',
  label,
  value,
  badge,
  badgeVariant,
  highlight,
  barWidth,
  barColor = '#871426',
  footer,
  onClick,
  active,
}: StatCardProps) {
  const showActive = active ?? highlight

  return (
    <Card
      className={`rounded-xl border bg-white p-4 space-y-2.5 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${showActive ? 'ring-2 ring-brand-primary-500 border-brand-primary-300 shadow-sm' : 'border-neutral-200 shadow-sm'}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className={`size-9 rounded-lg flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
          <Icon className="size-4" />
        </div>
        {badge && (
          <Badge variant={badgeVariant ?? (highlight ? 'destructive' : 'secondary')} className="font-medium text-[10px] px-1.5 py-0">
            {badge}
          </Badge>
        )}
      </div>
      <div>
        <p className="text-[11px] text-brand-neutral-500 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-xl font-bold tabular-nums text-brand-neutral-900 tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      {barWidth !== undefined && (
        <div className="h-1 bg-brand-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, barWidth))}%`, background: barColor }}
          />
        </div>
      )}
      {footer && <p className="text-[11px] text-brand-neutral-500">{footer}</p>}
    </Card>
  )
}
