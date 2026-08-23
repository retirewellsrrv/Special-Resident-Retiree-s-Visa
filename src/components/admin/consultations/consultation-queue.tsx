'use client'

import { CalendarClock, Inbox, Plus, FileText, Video } from 'lucide-react'
import Link from 'next/link'
import { StatusChip } from '@/components/ui/status-chip'
import type { ConsultationRow, ConsultationStats } from '@/actions/admin/consultations'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  zoom_meeting: Video,
  google_meet: Video,
  whatsApp: Video,
  face_2_face: CalendarClock,
  phone_call: CalendarClock,
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

interface Props {
  rows: ConsultationRow[]
  stats: ConsultationStats
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ConsultationQueue({ rows, stats, selectedId, onSelect }: Props) {
  return (
    <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-[300px] lg:min-h-0">
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <h3 className="text-sm font-semibold text-brand-neutral-900">Consultation Queue</h3>
        <p className="text-xs text-brand-neutral-400 mt-0.5">
          {stats.pending} pending &middot; {stats.total} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Inbox className="size-10 text-brand-neutral-300" />
            <p className="text-sm text-brand-neutral-400">No consultations found.</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          rows.map((row) => {
            const isSelected = row.id === selectedId
            const ModeIcon = MODE_ICONS[row.mode_communication] ?? CalendarClock
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(row.id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-brand-neutral-50 ${
                  isSelected ? 'bg-brand-primary-50/40 ring-1 ring-brand-primary-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isSelected ? 'bg-brand-primary-600 text-white' : 'bg-brand-neutral-100 text-brand-neutral-600'
                  }`}>
                    {initials(row.applicant_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium truncate ${
                        isSelected ? 'text-brand-primary-800' : 'text-brand-neutral-900'
                      }`}>
                        {row.applicant_name}
                      </p>
                      {row.has_application && (
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full bg-brand-goldAccent-1 text-brand-neutral-800 px-1.5 py-0.5 text-[9px] font-semibold"
                          title="Has a linked application"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          App
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-neutral-400 truncate mt-0.5">{row.purpose}</p>
                    <p className="text-[11px] text-brand-neutral-400 flex items-center gap-1 mt-1">
                      <ModeIcon className="h-3 w-3 shrink-0" />
                      {formatDate(row.meeting_date)}
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