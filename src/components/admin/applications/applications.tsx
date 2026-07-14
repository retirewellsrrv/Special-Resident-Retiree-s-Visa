'use client'

import { useState, useCallback, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatCard } from '@/components/admin/shared/stat-card'
import { FilterInput } from '@/components/admin/shared/filters'
import { ApplicationQueue } from './applications-queue'
import { ApplicationDetail } from './application-detail'
import { Pagination } from '@/components/ui/pagination'
import type { AppStats, AppRow, AppDetail } from '@/actions/admin/applications-admin'
import { getApplicationDetail } from '@/actions/admin/applications-admin'

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
}

export function ApplicationsClient({ stats, rows, total, page, statusFilter, userId, search }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AppDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const lastPage = Math.max(1, Math.ceil(total / 10))
  const autoSelected = useRef(false)
  const fetchRef = useRef(0)

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id)
  }, [])

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

  useEffect(() => {
    if (!autoSelected.current && rows.length > 0 && selectedId === null) {
      autoSelected.current = true
      handleSelect(rows[0].id)
    }
  }, [rows, selectedId, handleSelect])

  const handleStatusChange = useCallback(() => {
    setDetail(null)
    setSelectedId(null)
    autoSelected.current = false
    router.refresh()
  }, [router])

  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search, page: newPage })}`))
    },
    [router, statusFilter, userId, search, startTransition],
  )

  const handleFilterStatus = useCallback(
    (status?: string) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status, userId, search, page: 1 })}`))
    },
    [router, userId, search, startTransition],
  )

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search: q, page: 1 })}`))
    },
    [router, statusFilter, userId, startTransition],
  )

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Applications"
        description="Review and manage visa applications, their details, and submitted documents."
        actions={
          <FilterInput
            label="Search applications"
            placeholder="Search by name or application code..."
            defaultValue={search ?? ''}
            onChange={handleSearch}
            disabled={isPending}
            isPending={isPending}
            debounceMs={400}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total" value={stats.total} onClick={() => handleFilterStatus(undefined)} active={!statusFilter} />
        <StatCard icon={Clock} label="Pending" value={stats.pending} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" onClick={() => handleFilterStatus('pending')} active={statusFilter === 'pending'} />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} iconBgClass="bg-green-50" iconColorClass="text-green-600" onClick={() => handleFilterStatus('approved')} active={statusFilter === 'approved'} />
        <StatCard icon={AlertTriangle} label="Rejected" value={stats.rejected} badge={stats.rejected > 0 ? 'Needs Review' : undefined} iconBgClass="bg-red-50" iconColorClass="text-red-600" onClick={() => handleFilterStatus('rejected')} active={statusFilter === 'rejected'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 flex-1 min-h-0">
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
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}

        {loadingDetail ? (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Loading application details...</span>
            </div>
          </div>
        ) : detail ? (
          <ApplicationDetail detail={detail} onStatusChange={handleStatusChange} />
        ) : selectedId === null ? (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <p className="text-sm text-brand-neutral-400">Select an application to review.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <p className="text-sm text-brand-neutral-400">Application not found.</p>
          </div>
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
