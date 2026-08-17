'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { ReviewQueue } from './review-queue'
import { DocumentViewer } from './document-viewer'
import { ReviewActions } from './review-actions'
import { DesktopReviewBanner } from './desktop-review-banner'
import { Pagination } from '@/components/ui/pagination'
import type { DocumentForReview } from '@/actions/admin/documents'

const PER_PAGE = 20

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'In processing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'action need', label: 'Action need' },
]

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'most-pending', label: 'Most pending' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

type SortMode = 'latest' | 'oldest' | 'most-pending' | 'alphabetical'

interface Props {
  docs: DocumentForReview[]
  total: number
  page: number
  search?: string
  statusFilter?: string
  sort: SortMode
  initialSelectedId?: number | null
}

function buildQuery(params: { q?: string; status?: string; sort?: string; page: number }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.sort) sp.set('sort', params.sort)
  sp.set('page', String(params.page))
  return sp.toString()
}

export function DocumentsReview({ docs, total, page, search, statusFilter, sort, initialSelectedId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDoc, setSelectedDoc] = useState<DocumentForReview | null>(() => {
    if (initialSelectedId != null) {
      return docs.find((d) => d.id === initialSelectedId) ?? docs[0] ?? null
    }
    return docs[0] ?? null
  })
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const detailRef = useRef<HTMLDivElement>(null)
  const didMountRef = useRef(false)

  // Keep the selection valid when the result set changes (page/search/filter).
  useEffect(() => {
    setSelectedDoc((prev) => {
      if (prev && docs.some((d) => d.id === prev.id)) return prev
      return docs[0] ?? null
    })
  }, [docs])

  // On mobile/tablet (queue + viewer stack vertically), scroll the viewer into
  // view once a document is selected — but skip the initial mount so the page
  // doesn't auto-scroll past the queue on load.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (!selectedDoc || !detailRef.current) return
    if (window.matchMedia('(max-width: 1023px)').matches) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDoc])

  // Keyboard triage: ↑/↓ move through the queue (skips inputs).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (docs.length === 0) return
      const idx = selectedDoc ? docs.findIndex((d) => d.id === selectedDoc.id) : -1
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedDoc(docs[Math.min(idx + 1, docs.length - 1)])
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedDoc(docs[Math.max(idx - 1, 0)])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [docs, selectedDoc])

  const navigate = useCallback(
    (params: { q?: string; status?: string; sort?: string; page: number }) => {
      startTransition(() => router.push(`/admin/documents?${buildQuery(params)}`))
    },
    [router, startTransition],
  )

  const handleSearch = useCallback(
    (q: string) => navigate({ q: q || undefined, status: statusFilter, sort, page: 1 }),
    [navigate, statusFilter, sort],
  )

  const handleStatusChange = useCallback(
    (status: string) => navigate({ q: search, status: status === 'all' || status === '' ? undefined : status, sort, page: 1 }),
    [navigate, search, sort],
  )

  const handleSortChange = useCallback(
    (newSort: string) => navigate({ q: search, status: statusFilter, sort: newSort, page: 1 }),
    [navigate, search, statusFilter],
  )

  const handlePageChange = useCallback(
    (newPage: number) => navigate({ q: search, status: statusFilter, sort, page: newPage }),
    [navigate, search, statusFilter, sort],
  )

  const handleClearFilters = useCallback(() => {
    navigate({ page: 1 })
  }, [navigate])

  const hasActiveFilters = Boolean(search || statusFilter) || sort !== 'latest'

  // Select from the queue + mirror into the URL (history.replaceState avoids a
  // server round-trip) so a refresh preserves the open document.
  const handleSelect = useCallback((doc: DocumentForReview) => {
    setSelectedDoc(doc)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('doc', String(doc.id))
      window.history.replaceState(null, '', url.toString())
    }
  }, [])

  // Mobile "Back to queue" — the queue sits at the top of the stacked layout.
  const handleBackToQueue = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // After a review action, advance to the next doc still needing attention.
  // If the page is exhausted, fall through to the next page.
  const handleReviewed = useCallback(
    (docId: number) => {
      setSelectedDoc((prev) => {
        if (prev?.id !== docId) return prev
        const actionable = docs.filter(
          (d) => d.id !== docId && (d.status === 'pending' || d.status === 'processing'),
        )
        if (actionable.length > 0) return actionable[0]
        const next = docs.filter((d) => d.id !== docId)
        return next.length > 0 ? next[0] : null
      })
    },
    [docs],
  )

  // Selection emptied and more pages exist → load the next page of the queue.
  useEffect(() => {
    if (selectedDoc === null && docs.length > 0 && page < totalPages && !isPending) {
      handlePageChange(page + 1)
    }
  }, [selectedDoc, docs.length, page, totalPages, isPending, handlePageChange])

  const remainingOnPage = docs.filter((d) => d.status === 'pending' || d.status === 'processing').length

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader title="Document Review" />

      <FilterBar>
        <FilterInput
          label="Search"
          placeholder="Search by applicant name..."
          defaultValue={search ?? ''}
          onChange={handleSearch}
          disabled={isPending}
          isPending={isPending}
          debounceMs={400}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          onChange={handleStatusChange}
          disabled={isPending}
        />
        <FilterSelect
          label="Sort"
          value={sort}
          options={SORT_OPTIONS}
          placeholder="Latest first"
          onChange={handleSortChange}
          disabled={isPending}
        />
        {hasActiveFilters && <FilterClear onClick={handleClearFilters} disabled={isPending} />}
      </FilterBar>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 flex-1 min-h-0">
        <ReviewQueue
          docs={docs}
          selectedId={selectedDoc?.id ?? null}
          onSelect={handleSelect}
          sort={sort}
          hasFilters={Boolean(search || statusFilter)}
          onResetFilters={handleClearFilters}
          pending={isPending}
        />

        <div ref={detailRef} className="min-h-0 min-w-0 flex flex-col">
          {selectedDoc ? (
            <div className="flex flex-1 flex-col gap-3 min-h-0">
              <DesktopReviewBanner />
              <DocumentViewer doc={selectedDoc} onBack={handleBackToQueue} />
              {remainingOnPage > 0 && (
                <p className="px-1 text-xs text-brand-neutral-400">
                  {remainingOnPage} document{remainingOnPage !== 1 ? 's' : ''} awaiting review on this page
                </p>
              )}
              <div className="lg:sticky lg:bottom-4 z-10">
                <ReviewActions doc={selectedDoc} onStatusChange={handleReviewed} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <p className="text-sm text-brand-neutral-400">
                {hasActiveFilters ? 'No documents match the current filters.' : 'All documents have been reviewed.'}
              </p>
            </div>
          )}
        </div>
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
