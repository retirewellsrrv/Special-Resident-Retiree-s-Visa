'use client'

import { StatusChip } from '@/components/ui/status-chip'
import type { DocumentForReview, ReviewStats } from '@/actions/admin/documents'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  visa: 'Visa',
  nbi: 'NBI Clearance',
  pension: 'Pension Proof',
  medical: 'Medical Report',
}

interface Props {
  docs: DocumentForReview[]
  stats: ReviewStats
  selectedId: number | null
  onSelect: (doc: DocumentForReview) => void
}

export function ReviewQueue({ docs, stats, selectedId, onSelect }: Props) {
  const pendingCount = stats.pending + stats.processing

  return (
    <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <h3 className="text-sm font-semibold text-brand-neutral-900">Review Queue</h3>
        <p className="text-xs text-brand-neutral-400 mt-0.5">
          {pendingCount} document{pendingCount !== 1 ? 's' : ''} pending review
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {docs.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-brand-neutral-400">
            No documents to review.
          </div>
        ) : (
          docs.map((doc) => {
            const isSelected = doc.id === selectedId
            return (
              <button
                key={doc.id}
                onClick={() => onSelect(doc)}
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
                    {initials(doc.applicant_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isSelected ? 'text-brand-primary-800' : 'text-brand-neutral-900'
                    }`}>
                      {doc.applicant_name}
                    </p>
                    <p className="text-xs text-brand-neutral-400 truncate mt-0.5">
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </p>
                    <p className="text-[11px] text-brand-neutral-300 truncate mt-0.5">
                      {doc.application_code}
                    </p>
                  </div>
                  <StatusChip status={doc.status} className="shrink-0" />
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
