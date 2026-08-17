'use client'

import { useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { ApplicationQueue } from './applications-queue'
import { ApplicationDetail } from './application-detail'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import type { AppStats, AppRow, AppDetail } from '@/actions/admin/applications-admin'

function buildQuery(params: { status?: string; userId?: string; search?: string; page: number; app?: string }) {
  const sp = new URLSearchParams()
  if (params.status) sp.set('status', params.status)
  if (params.userId) sp.set('userId', params.userId)
  if (params.search) sp.set('q', params.search)
  if (params.app) sp.set('app', params.app)
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
  /** Selected application id from the ?app= URL param */
  appId?: string
  /** Detail for the selected application (fetched server-side) */
  detail: AppDetail | null
}

export function ApplicationsIndex({ stats, rows, total, page, statusFilter, userId, search, appId, detail }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const lastPage = Math.max(1, Math.ceil(total / 10))

  const parsedAppId = appId ? Number(appId) : null
  const hasAppParam = parsedAppId != null && !Number.isNaN(parsedAppId)

  // Mobile: the detail takes over as a full-screen workspace only when a real
  // ?app= resolves. Desktop: always show the detail pane (or a placeholder).
  const selectedApp = hasAppParam ? detail : null

  const selectApp = useCallback(
    (id: number) => {
      startTransition(() => {
        router.replace(`/admin/applications?${buildQuery({ status: statusFilter, userId, search, page, app: String(id) })}`)
      })
    },
    [router, statusFilter, userId, search, page, startTransition],
  )

  const clearSelection = useCallback(() => {
    router.replace(`/admin/applications?${buildQuery({ status: statusFilter, userId, search, page })}`)
  }, [router, statusFilter, userId, search, page])

  // After an application status change it may no longer match the active
  // filter, so return to the queue (matches the previous client-side flow).
  // Only clears when the id still matches the selected app — an in-flight
  // request from a previously viewed application must not wipe a new selection.
  const handleAppStatusChange = useCallback(
    (id: number) => {
      if (String(id) === appId) clearSelection()
    },
    [appId, clearSelection],
  )

  // A document review was saved inside the detail — silently re-fetch the
  // page's server components so `detail` reflects the new doc statuses.
  const handleDocReviewSaved = useCallback(() => {
    router.refresh()
  }, [router])

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search: q, page: 1, app: appId })}`))
    },
    [router, statusFilter, userId, appId, startTransition],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search, page: newPage, app: appId })}`))
    },
    [router, statusFilter, userId, search, appId, startTransition],
  )

  function handleClear() {
    startTransition(() => router.push(`/admin/applications?${buildQuery({ page: 1, app: appId })}`))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header + stats + filters: hidden on mobile while the detail is open */}
      <div className={cn('space-y-4', selectedApp && 'hidden xl:block')}>
        <PageHeader title="Manage Applications" />

        {/* Compact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Total</p>
              <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Pending</p>
              <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.pending}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-green-50 text-green-600">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Approved</p>
              <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.approved}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-red-50 text-red-600">
              <AlertTriangle className="size-4" />
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Rejected</p>
              <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.rejected}</p>
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
            onChange={(v) => startTransition(() => router.push(`/admin/applications?${buildQuery({ status: v !== 'all' ? v : undefined, userId, search, page: 1, app: appId })}`))}
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
      </div>

      {/* ── Desktop (xl+): two-pane master/detail ── */}
      <div className="hidden xl:grid xl:grid-cols-[420px_1fr] gap-4 flex-1 min-h-0">
        {isPending ? (
          <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
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
            stats={stats}
            selectedId={selectedApp?.id ?? null}
            onSelect={selectApp}
          />
        )}

        {selectedApp ? (
          <ApplicationDetail
            key={selectedApp.id}
            detail={selectedApp}
            onStatusChange={handleAppStatusChange}
            onDocReviewSaved={handleDocReviewSaved}
            className="rounded-xl border border-brand-neutral-200"
          />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <p className="text-sm text-brand-neutral-400">
              {hasAppParam ? 'Application not found.' : 'Select an application to review.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile (<xl): queue screen, or full-screen detail when an app is open ── */}
      <div className="xl:hidden flex flex-col flex-1 min-h-0">
        {selectedApp ? (
          <div className="fixed inset-0 z-40 flex flex-col bg-white">
            <ApplicationDetail
              key={selectedApp.id}
              detail={selectedApp}
              onBack={clearSelection}
              onStatusChange={handleAppStatusChange}
              onDocReviewSaved={handleDocReviewSaved}
              className="flex-1 min-h-0"
            />
          </div>
        ) : (
          <ApplicationQueue
            rows={rows}
            stats={stats}
            selectedId={null}
            onSelect={selectApp}
            className="flex-1 min-h-0"
          />
        )}
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