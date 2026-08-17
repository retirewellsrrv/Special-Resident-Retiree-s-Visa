'use client'

import { useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput } from '@/components/admin/shared/filters'
import { ReviewQueue } from './review-queue'
import { DocumentPreview } from './document-review/document-preview'
import { DocumentActions } from './document-review/document-actions'
import { DocumentReviewMobile } from './document-review/document-review-mobile'
import { Pagination } from '@/components/ui/pagination'
import { toast } from 'sonner'
import { updateDocumentStatus } from '@/actions/admin/documents'
import { cn } from '@/lib/utils'
import type { DocumentForReview, ReviewStats } from '@/actions/admin/documents'

const PER_PAGE = 20

type SortMode = 'latest' | 'oldest' | 'most-pending' | 'alphabetical'

interface Props {
  docs: DocumentForReview[]
  stats: ReviewStats
  total: number
  page: number
  search?: string
  sort: SortMode
  /** Selected document id from the ?doc= URL param */
  docId?: string
}

function buildQuery(params: { q?: string; sort?: string; page: number; doc?: string }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.sort) sp.set('sort', params.sort)
  if (params.doc) sp.set('doc', params.doc)
  sp.set('page', String(params.page))
  return sp.toString()
}

export function DocumentsIndex({ docs, stats, total, page, search, sort, docId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const parsedDocId = docId ? Number(docId) : null
  const hasDocParam = parsedDocId != null && !Number.isNaN(parsedDocId)

  // Mobile: the review workspace only takes over when a real ?doc= is present —
  // otherwise the queue is the screen. Desktop: always show a doc, defaulting
  // to the first row so the two-pane layout never renders empty.
  const selectedDoc = hasDocParam ? (docs.find((d) => d.id === parsedDocId) ?? null) : null
  const desktopDoc = selectedDoc ?? docs[0] ?? null
  const currentIdx = desktopDoc ? docs.findIndex((d) => d.id === desktopDoc.id) : -1

  const selectDoc = useCallback(
    (id: number) => {
      router.replace(`/admin/documents?${buildQuery({ q: search, sort, page, doc: String(id) })}`)
    },
    [router, search, sort, page],
  )

  const clearSelection = useCallback(() => {
    router.replace(`/admin/documents?${buildQuery({ q: search, sort, page })}`)
  }, [router, search, sort, page])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) selectDoc(docs[currentIdx - 1].id)
  }, [currentIdx, docs, selectDoc])

  const goNext = useCallback(() => {
    if (currentIdx >= 0 && currentIdx < docs.length - 1) selectDoc(docs[currentIdx + 1].id)
  }, [currentIdx, docs, selectDoc])

  // Keyboard navigation for desktop reviewers
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      }
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  const handleSave = useCallback(
    async (docId: number, status: string, note: string): Promise<boolean> => {
      const result = await updateDocumentStatus(docId, status, note.trim() || null)
      if (result.error) {
        toast.error(result.error)
        return false
      }
      toast.success('Document status updated')
      // Auto-advance to the next document in the current queue, or refresh
      // in place when this was the last one.
      const remaining = docs.filter((d) => d.id !== docId)
      const next = remaining[0] ?? null
      if (next) {
        selectDoc(next.id)
      } else {
        router.refresh()
      }
      return true
    },
    [docs, router, selectDoc],
  )

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/documents?${buildQuery({ q, sort, page: 1 })}`))
    },
    [router, startTransition, sort],
  )

  const handleSortChange = useCallback(
    (newSort: SortMode) => {
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

  const handleSelect = useCallback((doc: DocumentForReview) => selectDoc(doc.id), [selectDoc])

  return (
    <div className="flex flex-col gap-4">
      {/* Header: hidden on mobile while the review workspace takes over */}
      <div className={selectedDoc ? 'hidden lg:block' : undefined}>
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
      </div>

      {/* ── Desktop (lg+): three-panel master/detail — queue | preview | decision rail.
             Panels take natural height so the page itself scrolls. ── */}
      <div className="hidden lg:grid lg:grid-cols-[340px_1fr_300px] gap-4 items-start">
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
            selectedId={desktopDoc?.id ?? null}
            onSelect={handleSelect}
            sort={sort}
            onSortChange={handleSortChange}
          />
        )}

        {desktopDoc ? (
          <>
            <DocumentPreview doc={desktopDoc} className="min-h-[60vh]" />
            <DocumentActions doc={desktopDoc} onSave={handleSave} />
          </>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white p-8">
            <p className="text-sm text-brand-neutral-400">All documents have been reviewed.</p>
          </div>
        )}
      </div>

      {/* ── Mobile (<lg): queue screen, or full-screen workspace when a doc is open ── */}
      <div className={cn('lg:hidden flex flex-col flex-1 min-h-0 relative')}>
        {selectedDoc ? (
          <DocumentReviewMobile
            doc={selectedDoc}
            docs={docs}
            onBack={clearSelection}
            onPrev={goPrev}
            onNext={goNext}
            onSave={handleSave}
          />
        ) : (
          <ReviewQueue
            docs={docs}
            stats={stats}
            selectedId={null}
            onSelect={handleSelect}
            sort={sort}
            onSortChange={handleSortChange}
            className="flex-1 min-h-0"
          />
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
