'use client'

import { useState, useCallback, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { ApplicationQueue } from './applications-queue'
import { ApplicationDetail } from './application-detail'
import { Pagination } from '@/components/ui/pagination'
import type { AppStats, AppRow, AppDetail } from '@/actions/admin/applications-admin'
import { getApplicationDetail } from '@/actions/admin/applications-admin'
import { cn } from '@/lib/utils'

function buildQuery(params: { status?: string; userId?: string; search?: string; page: number }) {
  const sp = new URLSearchParams()
  if (params.status) sp.set('status', params.status)
  if (params.userId) sp.set('userId', params.userId)
  if (params.search) sp.set('q', params.search)
  sp.set('page', String(params.page))
  return sp.toString()
}

interface Props {
  stats: AppStats
  rows: AppRow[]
  total: number
  page: number
  statusFilter?: string
  userId?: string
  search?: string
  /** Deep link target from the Documents page (?app=<id>) — pre-selects the application. */
  initialAppId?: number | null
}

export function ApplicationsClient({ stats: _stats, rows, total, page, statusFilter, userId, search, initialAppId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AppDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  // Mobile/tablet (<lg): the detail pane becomes a full-screen mode and the
  // queue hides behind it. Desktop (lg+) always shows both panes.
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const lastPage = Math.max(1, Math.ceil(total / 10))
  const fetchRef = useRef(0)
  const detailRef = useRef<HTMLDivElement>(null)
  const didInitRef = useRef(false)

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id)
    setMobileDetailOpen(true)
  }, [])

  // Hydration-safe initial selection for ?app= deep links. Runs once so a
  // later manual selection is never overridden. On mobile the deep link lands
  // directly in the full-screen detail mode.
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    if (initialAppId != null) {
      setSelectedId(initialAppId)
      setMobileDetailOpen(true)
    }
  }, [initialAppId])

  useEffect(() => {
    if (selectedId === null) { setDetail(null); return }
    const id = ++fetchRef.current
    setLoadingDetail(true)
    getApplicationDetail(selectedId).then((data) => {
      if (id !== fetchRef.current) return
      setDetail(data)
      setLoadingDetail(false)
    })
  }, [selectedId])

  // Scroll the detail pane into view only in the stacked lg–xl range. Below lg
  // the detail is a full-screen mode (no scrolling needed); at xl+ it sits
  // side-by-side with the queue.
  useEffect(() => {
    if (!detail || !detailRef.current) return
    if (window.matchMedia('(min-width: 1024px) and (max-width: 1279px)').matches) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [detail])

  // Called when the overall application status changes (pending → approved, etc.)
  // Deselects the application because it may no longer be in the current filter.
  const handleAppStatusChange = useCallback(() => {
    setDetail(null)
    setSelectedId(null)
    setMobileDetailOpen(false)
    router.refresh()
  }, [router])

  // Called when a document review is saved (status unchanged for the app itself).
  // Silently re-fetches the detail to keep data fresh, without deselecting.
  const handleDocReviewSaved = useCallback(() => {
    if (selectedId === null) return
    getApplicationDetail(selectedId).then((data) => {
      if (data) setDetail(data)
    })
  }, [selectedId])

  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search, page: newPage })}`))
    },
    [router, statusFilter, userId, search, startTransition],
  )

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search: q, page: 1 })}`))
    },
    [router, statusFilter, userId, startTransition],
  )

  function handleClear() {
    startTransition(() => router.push(`/admin/applications?${buildQuery({ page: 1 })}`))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader title="Manage Applications" />

      {/* Compact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Total</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{_stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
            <Clock className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Pending</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{_stats.pending}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-green-50 text-green-600">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Approved</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{_stats.approved}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-red-50 text-red-600">
            <AlertTriangle className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Rejected</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{_stats.rejected}</p>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterSelect
          label="Status"
          placeholder="All Status"
          value={statusFilter}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'paused', label: 'Paused' },
          ]}
          onChange={(v) => startTransition(() => router.push(`/admin/applications?${buildQuery({ status: v !== 'all' ? v : undefined, userId, search, page: 1 })}`))}
          disabled={isPending}
        />
        <FilterInput
          label="Search applications"
          placeholder="Search by name or code..."
          defaultValue={search ?? ''}
          onChange={handleSearch}
          disabled={isPending}
          isPending={isPending}
          debounceMs={400}
        />
        <FilterClear onClick={handleClear} disabled={isPending} />
      </FilterBar>

            {/* Grid row constrained (minmax(0,1fr)) so the queue/detail columns
          scroll internally instead of growing the page */}
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] xl:grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0">
        {isPending ? (
          <aside className={cn('flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0', mobileDetailOpen && 'hidden lg:flex')}>
            <div className="px-4 py-3 border-b border-brand-neutral-100">
              <h3 className="text-sm font-semibold text-brand-neutral-900">Applications</h3>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-brand-neutral-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-brand-neutral-100 rounded" />
                    <div className="h-3 w-20 bg-brand-neutral-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        ) : (
          <ApplicationQueue
            rows={rows}
            stats={_stats}
            selectedId={selectedId}
            onSelect={handleSelect}
            className={cn(mobileDetailOpen && 'hidden lg:flex')}
          />
        )}

        <div
          ref={detailRef}
          className={cn('min-h-0 min-w-0 flex flex-col', !mobileDetailOpen && 'hidden lg:flex')}
        >
          {loadingDetail ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Loading application details...</span>
              </div>
            </div>
          ) : detail ? (
            <ApplicationDetail
              detail={detail}
              onStatusChange={handleAppStatusChange}
              onDocReviewSaved={handleDocReviewSaved}
              onBack={() => setMobileDetailOpen(false)}
            />
          ) : selectedId === null ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <p className="text-sm text-brand-neutral-400">Select an application to review.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <p className="text-sm text-brand-neutral-400">Application not found.</p>
            </div>
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={lastPage}
        total={total}
        perPage={10}
        onChange={handlePageChange}
        disabled={isPending}
      />
    </div>
  )
}
