'use client'

import { useState, useCallback, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatCard } from '@/components/admin/shared/stat-card'
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

  const [searchValue, setSearchValue] = useState(search ?? '')

  const handleSearch = useCallback(
    (q: string) => {
      startTransition(() => router.push(`/admin/applications?${buildQuery({ status: statusFilter, userId, search: q, page: 1 })}`))
    },
    [router, statusFilter, userId, startTransition],
  )

  const handleClear = useCallback(() => {
    setSearchValue('')
    handleSearch('')
  }, [handleSearch])

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Applications"
        description="Review and manage visa applications, their details, and submitted documents."
        actions={
          <div className="relative">
            {isPending ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-brand-primary-600" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral-400" />
            )}
            <input
              type="text"
              placeholder="Search by name or application code..."
              aria-label="Search applications"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(searchValue)
              }}
              disabled={isPending}
              className="w-72 pl-9 pr-8 py-2 text-sm rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 placeholder:text-brand-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-50 disabled:cursor-wait"
            />
            {searchValue && !isPending && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-neutral-400 hover:text-brand-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total" value={stats.total} onClick={() => handleFilterStatus(undefined)} active={!statusFilter} />
        <StatCard icon={Clock} label="Pending" value={stats.pending} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" onClick={() => handleFilterStatus('pending')} active={statusFilter === 'pending'} />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} iconBgClass="bg-green-50" iconColorClass="text-green-600" onClick={() => handleFilterStatus('approved')} active={statusFilter === 'approved'} />
        <StatCard icon={AlertTriangle} label="Rejected" value={stats.rejected} badge={stats.rejected > 0 ? 'Needs Review' : undefined} iconBgClass="bg-red-50" iconColorClass="text-red-600" onClick={() => handleFilterStatus('rejected')} active={statusFilter === 'rejected'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 flex-1 min-h-0">
        <ApplicationQueue
          rows={rows}
          stats={stats}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

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
