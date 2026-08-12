'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, FileIcon, Inbox, Plus, MessageSquare } from 'lucide-react'
import Link from 'next/link'
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

type SortMode = 'latest' | 'oldest' | 'most-pending' | 'alphabetical'

const SORT_LABELS: Record<SortMode, string> = {
  latest: 'Latest',
  oldest: 'Oldest',
  'most-pending': 'Most pending',
  alphabetical: 'Alphabetical',
}

interface Props {
  docs: DocumentForReview[]
  stats: ReviewStats
  selectedId: number | null
  onSelect: (doc: DocumentForReview) => void
  sort: SortMode
  onSortChange: (sort: SortMode) => void
}

export function ReviewQueue({ docs, stats, selectedId, onSelect, sort, onSortChange }: Props) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(() => {
    if (selectedId !== null) {
      const selectedDoc = docs.find((d) => d.id === selectedId)
      if (selectedDoc) return new Set([selectedDoc.user_id])
    }
    return new Set()
  })

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; docs: DocumentForReview[]; pendingCount: number; latestDate: string }>()
    for (const doc of docs) {
      const key = doc.user_id
      if (!map.has(key)) {
        map.set(key, { name: doc.applicant_name, docs: [], pendingCount: 0, latestDate: doc.created_at })
      }
      const group = map.get(key)!
      group.docs.push(doc)
      if (doc.status === 'pending' || doc.status === 'processing') {
        group.pendingCount++
      }
      if (doc.created_at > group.latestDate) {
        group.latestDate = doc.created_at
      }
    }
    const entries = Array.from(map.entries())
    switch (sort) {
      case 'oldest':
        return entries.sort(([, a], [, b]) => a.latestDate.localeCompare(b.latestDate) || a.name.localeCompare(b.name))
      case 'most-pending':
        return entries.sort(([, a], [, b]) => b.pendingCount - a.pendingCount || a.name.localeCompare(b.name))
      case 'alphabetical':
        return entries.sort(([, a], [, b]) => a.name.localeCompare(b.name))
      default:
        return entries.sort(([, a], [, b]) => b.latestDate.localeCompare(a.latestDate) || a.name.localeCompare(b.name))
    }
  }, [docs, sort])

  function toggleUser(userId: string) {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  return (
    <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brand-neutral-900">Review Queue</h3>
            <p className="text-xs text-brand-neutral-400 mt-0.5">
              {docs.length} document{docs.length !== 1 ? 's' : ''} from {grouped.length} applicant{grouped.length !== 1 ? 's' : ''}
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="text-[11px] rounded-md border border-brand-neutral-200 bg-white text-brand-neutral-600 px-2 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            aria-label="Sort order"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Inbox className="size-10 text-brand-neutral-300" />
            <p className="text-sm text-brand-neutral-400">No documents to review.</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        ) : (
          grouped.map(([userId, group]) => {
            const isExpanded = expandedUsers.has(userId)

            return (
              <div key={userId}>
                <button
                  onClick={() => toggleUser(userId)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-brand-neutral-50 sticky top-0 bg-white z-10 border-b border-brand-neutral-100"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-brand-neutral-100 text-brand-neutral-600 text-[9px] font-bold shrink-0">
                    {initials(group.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-neutral-900 truncate">{group.name}</p>
                    <p className="text-[11px] text-brand-neutral-400">
                      {group.docs.length} document{group.docs.length !== 1 ? 's' : ''}
                      {group.pendingCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          {group.pendingCount} pending
                        </span>
                      )}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-3.5 text-brand-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 text-brand-neutral-400 shrink-0" />
                  )}
                </button>

                {isExpanded && group.docs.map((doc) => {
                  const isSelected = doc.id === selectedId
                  return (
                    <button
                      key={doc.id}
                      onClick={() => onSelect(doc)}
                      className={`w-full flex items-start gap-3 pl-9 pr-4 py-2.5 text-left transition-colors hover:bg-brand-neutral-50 ${
                        isSelected ? 'bg-brand-primary-50/40 ring-1 ring-inset ring-brand-primary-200' : ''
                      }`}
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-neutral-50 text-brand-neutral-400 shrink-0">
                        <FileIcon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isSelected ? 'text-brand-primary-800' : 'text-brand-neutral-900'
                        }`}>
                          {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                        </p>
                        <p className="text-[11px] text-brand-neutral-400 truncate mt-0.5">{doc.name}</p>
                        <p className="text-[10px] text-brand-neutral-300 truncate mt-0.5">{doc.application_code}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.review_note && doc.review_note.length > 0 && (
                          <MessageSquare className="h-3 w-3 text-amber-500" />
                        )}
                        <StatusChip status={doc.status} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
