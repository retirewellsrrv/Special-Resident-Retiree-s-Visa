'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { ReviewQueue } from './review-queue'
import { DocumentViewer } from './document-viewer'
import { ReviewActions } from './review-actions'
import { Pagination } from '@/components/ui/pagination'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
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

  // Selection starts empty so mobile renders the queue list first; the init
  // effect below hydrates it (desktop auto-selects the first document, and
  // `?doc=` deep links are honoured on every viewport). Doing it in an effect
  // (not a useState initializer) keeps server HTML and client render identical.
  const [selectedDoc, setSelectedDoc] = useState<DocumentForReview | null>(null)
  const didInitRef = useRef(false)
  const detailRef = useRef<HTMLDivElement>(null)

  // Mobile queue bottom sheet
  const [queueOpen, setQueueOpen] = useState(false)

  // Set when the last doc on this page was reviewed and the queue is empty —
  // the only case where returning to a "null" selection should load the next
  // page. Going back to the list manually must NOT jump pages.
  const forceAdvanceRef = useRef(false)
  // Set right before a page advance so the fresh page re-opens the first
  // document, keeping the triage flow continuous after a page is exhausted.
  const reselectAfterPageRef = useRef(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const isDesktop = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

  // Hydration-safe initial selection
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    if (initialSelectedId != null) {
      setSelectedDoc(docs.find((d) => d.id === initialSelectedId) ?? docs[0] ?? null)
    } else if (isDesktop()) {
      setSelectedDoc(docs[0] ?? null)
    }
  }, [initialSelectedId, docs])

  // Keep the selection valid when the result set changes (page/search/filter).
  useEffect(() => {
    setSelectedDoc((prev) => {
      if (prev && docs.some((d) => d.id === prev.id)) return prev
      // A fresh page arrived right after the previous one was exhausted —
      // re-open the first document so triage continues without a tap.
      if (reselectAfterPageRef.current && docs.length > 0) {
        reselectAfterPageRef.current = false
        return docs[0]
      }
      if (isDesktop()) return docs[0] ?? null
      return null
    })
  }, [docs])

  // On mobile/tablet, entering review mode swaps the queue for the full-screen
  // review view; make sure the top of the review view is in view.
  useEffect(() => {
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

  // Mobile "Back to queue" — exits review mode back to the list, never
  // auto-advances to the next page, and drops the ?doc= deep link.
  const handleBackToQueue = useCallback(() => {
    setSelectedDoc(null)
    forceAdvanceRef.current = false
    reselectAfterPageRef.current = false
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('doc')
      window.history.replaceState(null, '', url.toString())
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // After a review action, advance to the next doc still needing attention.
  // If the page is exhausted, fall through to the next page (via forceAdvanceRef).
  const handleReviewed = useCallback(
    (docId: number) => {
      setSelectedDoc((prev) => {
        if (prev?.id !== docId) return prev
        const actionable = docs.filter(
          (d) => d.id !== docId && (d.status === 'pending' || d.status === 'processing'),
        )
        if (actionable.length > 0) {
          forceAdvanceRef.current = false
          return actionable[0]
        }
        const next = docs.filter((d) => d.id !== docId)
        if (next.length > 0) {
          forceAdvanceRef.current = false
          return next[0]
        }
        forceAdvanceRef.current = true
        return null
      })
    },
    [docs],
  )

  // Selection emptied because the page's queue was exhausted → load next page.
  useEffect(() => {
    if (selectedDoc === null && docs.length > 0 && page < totalPages && !isPending && forceAdvanceRef.current) {
      forceAdvanceRef.current = false
      reselectAfterPageRef.current = true
      handlePageChange(page + 1)
    }
  }, [selectedDoc, docs.length, page, totalPages, isPending, handlePageChange])

  const remainingOnPage = docs.filter((d) => d.status === 'pending' || d.status === 'processing').length

  const selectedIndex = selectedDoc ? docs.findIndex((d) => d.id === selectedDoc.id) : -1

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader title="Document Review" />

      {/* Filters — hidden on mobile while reviewing so the document owns the screen */}
      <div className={cn(selectedDoc ? 'hidden lg:block' : '')}>
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
      </div>

      {/* Grid row is explicitly constrained (minmax(0,1fr)) so the queue and
          viewer scroll internally instead of growing the page — otherwise the
          sticky action card hovers over the pagination below */}
      <div className="flex flex-col lg:grid lg:grid-cols-[360px_1fr] lg:grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0">
        {/* Queue — desktop always; on mobile only in list mode (hidden while reviewing) */}
        <div className={cn('min-h-0', selectedDoc ? 'hidden lg:block' : '')}>
          <ReviewQueue
            docs={docs}
            selectedId={selectedDoc?.id ?? null}
            onSelect={handleSelect}
            sort={sort}
            hasFilters={Boolean(search || statusFilter)}
            onResetFilters={handleClearFilters}
            pending={isPending}
          />
        </div>

        {/* Detail / review pane — hidden on mobile in list mode, fills the
            viewport on mobile while reviewing so the action dock stays pinned */}
        <div ref={detailRef} className={cn('min-h-0 min-w-0 flex flex-col', selectedDoc ? 'flex-1 lg:flex' : 'hidden lg:flex')}>
          {selectedDoc ? (
            <div className="flex flex-1 flex-col gap-3 min-h-0">
              <DocumentViewer doc={selectedDoc} onBack={handleBackToQueue} />
              {remainingOnPage > 0 && (
                <p className="px-1 text-xs text-brand-neutral-400">
                  {remainingOnPage} document{remainingOnPage !== 1 ? 's' : ''} awaiting review on this page
                </p>
              )}
              <div className="lg:sticky lg:bottom-4 z-10">
                <ReviewActions doc={selectedDoc} onStatusChange={handleReviewed} />
              </div>

              {/* Mobile-only triage row: prev · queue · next */}
              <div className="lg:hidden shrink-0">
                <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-neutral-200 bg-white px-2 py-2">
                  <button
                    onClick={() => selectedIndex > 0 && handleSelect(docs[selectedIndex - 1])}
                    disabled={selectedIndex <= 0}
                    className="inline-flex items-center justify-center w-10 h-9 rounded-md border border-brand-neutral-200 text-brand-neutral-600 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous document"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setQueueOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand-neutral-200 px-3 h-9 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 transition-colors"
                    aria-haspopup="dialog"
                  >
                    <List className="h-4 w-4" />
                    Queue
                    <span className="text-xs text-brand-neutral-400 tabular-nums">
                      {selectedIndex + 1}/{docs.length}
                    </span>
                  </button>
                  <button
                    onClick={() => selectedIndex < docs.length - 1 && handleSelect(docs[selectedIndex + 1])}
                    disabled={selectedIndex >= docs.length - 1}
                    className="inline-flex items-center justify-center w-10 h-9 rounded-md border border-brand-neutral-200 text-brand-neutral-600 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next document"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
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

      {/* Pagination — hidden on mobile while reviewing */}
      <div className={cn(selectedDoc ? 'hidden lg:block' : '')}>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={PER_PAGE}
          onChange={handlePageChange}
          disabled={isPending}
        />
      </div>

      {/* Mobile: queue bottom sheet (review mode) */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent side="bottom" className="!h-[70dvh] p-0 gap-0 flex flex-col">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ReviewQueue
              docs={docs}
              selectedId={selectedDoc?.id ?? null}
              onSelect={(doc) => {
                handleSelect(doc)
                setQueueOpen(false)
              }}
              sort={sort}
              hasFilters={Boolean(search || statusFilter)}
              onResetFilters={handleClearFilters}
              pending={isPending}
              className="flex-1 min-h-0 rounded-none border-0"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}