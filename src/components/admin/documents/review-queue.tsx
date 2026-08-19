'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, FileIcon, Inbox, MessageSquare, Plus, SearchX } from 'lucide-react'
import Link from 'next/link'
import { StatusChip } from '@/components/ui/status-chip'
import { documentTypeLabel, DOC_TYPE_ICONS } from './document-labels'
import type { DocumentForReview } from '@/actions/admin/documents'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

type SortMode = 'latest' | 'oldest' | 'most-pending' | 'alphabetical'

interface Props {
  docs: DocumentForReview[]
  selectedId: number | null
  onSelect: (doc: DocumentForReview) => void
  sort: SortMode
  /** Active filters narrow the result set — changes the empty state copy */
  hasFilters?: boolean
  onResetFilters?: () => void
  /** Soft loading state (keeps the list mounted instead of swapping skeletons) */
  pending?: boolean
  /** Extra classes for the root (e.g. flex sizing when embedded in a sheet) */
  className?: string
}

export function ReviewQueue({ docs, selectedId, onSelect, sort, hasFilters, onResetFilters, pending, className }: Props) {
  // Auto-expand every applicant group: the queue is a triage list, not an
  // accordion gate. Re-sync whenever the result set changes.
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(
    () => new Set(docs.map((d) => d.user_id)),
  )

  useEffect(() => {
    setExpandedUsers(new Set(docs.map((d) => d.user_id)))
  }, [docs])

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
    <aside className={cn(
      'relative flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0',
      className,
    )}>
      {/* Soft loading indicator — list stays mounted, no skeleton swap */}
      {pending && (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden rounded-t-xl">
          <div className="h-full w-full animate-pulse bg-brand-primary-600" />
        </div>
      )}

      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brand-neutral-900">Review Queue</h3>
            <p className="text-xs text-brand-neutral-400 mt-0.5">
              {docs.length} document{docs.length !== 1 ? 's' : ''} from {grouped.length} applicant{grouped.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50" aria-busy={pending || undefined}>
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            {hasFilters ? <SearchX className="size-10 text-brand-neutral-300" /> : <Inbox className="size-10 text-brand-neutral-300" />}
            <p className="text-sm text-brand-neutral-400">
              {hasFilters ? 'No documents match your filters.' : 'No documents to review.'}
            </p>
            {hasFilters && onResetFilters ? (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
              >
                <SearchX className="h-4 w-4" /> Clear filters
              </button>
            ) : (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
              >
                <Plus className="h-4 w-4" /> Back to Dashboard
              </Link>
            )}
          </div>
        ) : (
          grouped.map(([userId, group]) => {
            const isExpanded = expandedUsers.has(userId)

            return (
              <div key={userId}>
                <button
                  onClick={() => toggleUser(userId)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-brand-neutral-50 sticky top-0 bg-white z-10 border-b border-brand-neutral-100"
                  aria-expanded={isExpanded}
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

                {isExpanded && group.docs.map((doc) => (
                  <QueueRow
                    key={doc.id}
                    doc={doc}
                    isSelected={doc.id === selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}

function QueueRow({
  doc,
  isSelected,
  onSelect,
}: {
  doc: DocumentForReview
  isSelected: boolean
  onSelect: (doc: DocumentForReview) => void
}) {
  const Icon = DOC_TYPE_ICONS[doc.type] ?? FileIcon

  return (
    <button
      onClick={() => onSelect(doc)}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'w-full flex items-start gap-3 pl-9 pr-4 py-2.5 text-left transition-colors hover:bg-brand-neutral-50',
        isSelected ? 'bg-brand-primary-50/40 ring-1 ring-inset ring-brand-primary-200' : '',
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-neutral-50 text-brand-neutral-400 shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isSelected ? 'text-brand-primary-800' : 'text-brand-neutral-900')}>
          {documentTypeLabel(doc.type)}
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
}
