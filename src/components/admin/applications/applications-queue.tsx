'use client'

import { Inbox, Plus } from 'lucide-react'
import Link from 'next/link'
import { StatusChip } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'
import type { AppStats, AppRow } from '@/actions/admin/applications-admin'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

interface Props {
  rows: AppRow[]
  stats: AppStats
  selectedId: number | null
  onSelect: (id: number) => void
  className?: string
}

export function ApplicationQueue({ rows, stats, selectedId, onSelect, className }: Props) {
  return (
    <aside className={cn('flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-[300px] xl:min-h-0', className)}>
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <h3 className="text-sm font-semibold text-brand-neutral-900">Applications</h3>
        <p className="text-xs text-brand-neutral-400 mt-0.5">
          {stats.pending} pending &middot; {stats.total} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Inbox className="size-10 text-brand-neutral-300" />
            <p className="text-sm text-brand-neutral-400">No applications found.</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        ) : (
          rows.map((row) => {
            const isSelected = row.id === selectedId
            return (
              <button
                key={row.id}
                onClick={() => onSelect(row.id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-brand-neutral-50 ${
                  isSelected ? 'bg-brand-primary-50/40 ring-1 ring-brand-primary-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isSelected
                      ? 'bg-brand-primary-600 text-white'
                      : 'bg-brand-neutral-100 text-brand-neutral-600'
                  }`}>
                    {initials(row.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isSelected ? 'text-brand-primary-800' : 'text-brand-neutral-900'
                    }`}>
                      {row.name}
                    </p>
                    <p className="text-xs text-brand-neutral-400 truncate mt-0.5">
                      {row.application_code}
                    </p>
                  </div>
                  <StatusChip status={row.status} className="shrink-0" />
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
