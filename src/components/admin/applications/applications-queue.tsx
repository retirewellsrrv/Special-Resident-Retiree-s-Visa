'use client'

import { StatusChip } from '@/components/ui/status-chip'
import type { AppStats, AppRow } from '@/actions/admin/applications-admin'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

interface Props {
  rows: AppRow[]
  stats: AppStats
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ApplicationQueue({ rows, stats, selectedId, onSelect }: Props) {
  return (
    <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <h3 className="text-sm font-semibold text-brand-neutral-900">Applications</h3>
        <p className="text-xs text-brand-neutral-400 mt-0.5">
          {stats.pending} pending &middot; {stats.total} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-brand-neutral-400">
            No applications found.
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
