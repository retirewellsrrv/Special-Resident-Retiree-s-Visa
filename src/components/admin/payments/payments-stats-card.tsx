'use client'

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  label: string
  value: string | number
  icon: string
  barWidth?: number
  barColor?: string
  footer?: ReactNode
}

export default function StatCard({ label, value, icon, barWidth = 0, barColor = '#871426', footer }: Props) {
  return (
    <Card className="bg-white border-brand-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">{label}</span>
          <div className="size-7 rounded-lg bg-brand-primary-50 flex items-center justify-center">
            <i className={`ti ${icon} text-brand-primary-600 text-sm`} aria-hidden="true" />
          </div>
        </div>
        <div className="text-2xl font-display font-bold text-brand-neutral-900 tracking-tight">{value}</div>
        <div className="h-1 bg-brand-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, barWidth))}%`, background: barColor }}
          />
        </div>
        {footer && <p className="text-[11px] text-brand-neutral-500">{footer}</p>}
      </CardContent>
    </Card>
  )
}
