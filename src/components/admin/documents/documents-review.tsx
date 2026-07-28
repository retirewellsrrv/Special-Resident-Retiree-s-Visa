'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput } from '@/components/admin/shared/filters'
import { ReviewQueue } from './review-queue'
import { DocumentViewer } from './document-viewer'
import { ReviewActions } from './review-actions'
import { Pagination } from '@/components/ui/pagination'
import type { DocumentForReview, ReviewStats } from '@/actions/admin/documents'

const PER_PAGE = 20

interface Props {
  docs: DocumentForReview[]
  stats: ReviewStats
  total: number
  page: number
  search?: string
  sort: 'latest' | 'oldest' | 'most-pending' | 'alphabetical'
}

function buildQuery(params: { q?: string; sort?: string; page: number }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.sort) sp.set('sort', params.sort)
  sp.set('page', String(params.page))
  return sp.toString()
}

export function DocumentsReview({ docs, stats, total, page, search, sort }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDoc, setSelectedDoc] = useState<DocumentForReview | null>(docs[0] ?? null)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/documents?${buildQuery({ q, sort, page: 1 })}`))
    },
    [router, startTransition, sort],
  )

  const handleSortChange = useCallback(
    (newSort: 'latest' | 'oldest' | 'most-pending' | 'alphabetical') => {
      startTransition(() => router.push(`/admin/documents?${buildQuery({ q: search, sort: newSort, page: 1 })}`))
    },
    [router, startTransition, search],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => router.push(`/admin/documents?${buildQuery({ q: search, sort, page: newPage })}`))
    },
    [router, search, sort, startTransition],
  )

  const handleSelect = useCallback((doc: DocumentForReview) => {
    setSelectedDoc(doc)
  }, [])

  const handleStatusChange = useCallback((docId: number) => {
    setSelectedDoc((prev) => {
      if (prev?.id !== docId) return prev
      const remaining = docs.filter((d) => d.id !== docId)
      return remaining[0] ?? null
    })
  }, [docs])

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Document Review"
        actions={
          <FilterInput
            label="Search documents"
            placeholder="Search by applicant name..."
            defaultValue={search ?? ''}
            onChange={handleSearch}
            disabled={isPending}
            isPending={isPending}
            debounceMs={400}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 flex-1 min-h-0">
        {isPending ? (
          <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-brand-neutral-100">
              <h3 className="text-sm font-semibold text-brand-neutral-900">Review Queue</h3>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-brand-neutral-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 bg-brand-neutral-100 rounded" />
                    <div className="h-3 w-16 bg-brand-neutral-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        ) : (
          <ReviewQueue
            docs={docs}
            stats={stats}
            selectedId={selectedDoc?.id ?? null}
            onSelect={handleSelect}
            sort={sort}
            onSortChange={handleSortChange}
          />
        )}

        {selectedDoc ? (
          <div className="flex flex-col gap-3 min-h-0">
            <DocumentViewer doc={selectedDoc} />
            <ReviewActions doc={selectedDoc} onStatusChange={handleStatusChange} />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <p className="text-sm text-brand-neutral-400">All documents have been reviewed.</p>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={PER_PAGE}
        onChange={handlePageChange}
        disabled={isPending}
      />
    </div>
  )
}
