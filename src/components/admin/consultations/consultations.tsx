'use client'

import { useState, useCallback, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CalendarClock, Clock, CheckCircle2, XCircle, Loader } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { ConsultationQueue } from './consultation-queue'
import { ConsultationDetail } from './consultation-detail'
import { Pagination } from '@/components/ui/pagination'
import type { ConsultationStats, ConsultationRow, ConsultationDetail as ConsultationDetailType } from '@/actions/admin/consultations'
import { getConsultationDetail } from '@/actions/admin/consultations'

const PER_PAGE = 10

function buildQuery(params: { status?: string; search?: string; page: number }) {
  const sp = new URLSearchParams()
  if (params.status && params.status !== 'all') sp.set('status', params.status)
  if (params.search) sp.set('q', params.search)
  sp.set('page', String(params.page))
  return sp.toString()
}

interface Props {
  stats: ConsultationStats
  rows: ConsultationRow[]
  total: number
  page: number
  statusFilter?: string
  search?: string
}

export function ConsultationsClient({ stats, rows, total, page, statusFilter, search }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<ConsultationDetailType | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))
  const fetchRef = useRef(0)
  const detailRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id)
  }, [])

  useEffect(() => {
    if (selectedId === null) { setDetail(null); return }
    const id = ++fetchRef.current
    setLoadingDetail(true)
    getConsultationDetail(selectedId)
      .then((data) => {
        if (id !== fetchRef.current) return
        setDetail(data)
        setLoadingDetail(false)
      })
      .catch(() => {
        if (id !== fetchRef.current) return
        setDetail(null)
        setLoadingDetail(false)
      })
  }, [selectedId])

  // On mobile/tablet (queue + detail stack vertically), scroll the detail pane
  // into view once it loads so the admin doesn't have to hunt for it.
  useEffect(() => {
    if (!detail || !detailRef.current) return
    if (window.matchMedia('(max-width: 1023px)').matches) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [detail])

  // Called when the consultation status changes: keep the detail open with fresh
  // data so admins can quickly process the queue, and refresh the list/stats.
  const handleStatusChange = useCallback(() => {
    if (selectedId === null) return
    getConsultationDetail(selectedId)
      .then((data) => {
        if (data) setDetail(data)
      })
      .catch(() => {})
    router.refresh()
  }, [selectedId, router])

  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => router.push(`/admin/consultations?${buildQuery({ status: statusFilter, search, page: newPage })}`))
    },
    [router, statusFilter, search, startTransition],
  )

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/consultations?${buildQuery({ status: statusFilter, search: q, page: 1 })}`))
    },
    [router, statusFilter, startTransition],
  )

  function handleClear() {
    startTransition(() => router.push(`/admin/consultations?${buildQuery({ page: 1 })}`))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader title="Manage Consultations" />

      {/* Compact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand-neutral-50 text-brand-neutral-600">
            <CalendarClock className="size-4" />
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
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <Loader className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Processing</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.processing}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-green-50 text-green-600">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Accepted</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.accepted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand-primary-50 text-brand-primary-700">
            <XCircle className="size-4" />
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
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          onChange={(v) => startTransition(() => router.push(`/admin/consultations?${buildQuery({ status: v, search, page: 1 })}`))}
          disabled={isPending}
        />
        <FilterInput
          label="Search consultations"
          placeholder="Search by applicant name..."
          defaultValue={search ?? ''}
          onChange={handleSearch}
          disabled={isPending}
          isPending={isPending}
          debounceMs={400}
        />
        <FilterClear onClick={handleClear} disabled={isPending} />
      </FilterBar>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 flex-1 min-h-0">
        {isPending ? (
          <aside className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-brand-neutral-100">
              <h3 className="text-sm font-semibold text-brand-neutral-900">Consultations</h3>
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
          <ConsultationQueue
            rows={rows}
            stats={stats}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}

        <div ref={detailRef} className="min-h-0 min-w-0 flex flex-col">
          {loadingDetail ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Loading consultation details...</span>
              </div>
            </div>
          ) : detail ? (
            <ConsultationDetail
              detail={detail}
              onStatusChange={handleStatusChange}
            />
          ) : selectedId === null ? (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <p className="text-sm text-brand-neutral-400">Select a consultation to review.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
              <p className="text-sm text-brand-neutral-400">Consultation not found.</p>
            </div>
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={lastPage}
        total={total}
        perPage={PER_PAGE}
        onChange={handlePageChange}
        disabled={isPending}
      />
    </div>
  )
}