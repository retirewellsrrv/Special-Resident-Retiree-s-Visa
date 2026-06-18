'use client'

import { useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Pagination } from '@/components/ui/pagination'
import { ApplicationsTable } from './applications-table'
import { TableSkeleton } from '@/components/ui/loading'
import type { AppStats, AppRow } from '@/actions/admin/applications-admin'

const STATUS_LABELS: Record<string, string> = {
  paused: 'Paused',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface ApplicationsClientProps {
  stats: AppStats
  rows: AppRow[]
  total: number
  page: number
  statusFilter?: string
}

export function ApplicationsClient({
  stats,
  rows,
  total,
  page,
  statusFilter,
}: ApplicationsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const lastPage = Math.max(1, Math.ceil(total / 10))

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams()
      if (value && value !== 'all') params.set('status', value)
      startTransition(() => router.push(`/admin/applications?${params.toString()}`))
    },
    [router],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(newPage))
      startTransition(() => router.push(`/admin/applications?${params.toString()}`))
    },
    [router, statusFilter],
  )

  const statCards = [
    { label: 'Total', value: stats.total },
    { label: 'Paused', value: stats.paused },
    { label: 'Pending', value: stats.pending },
    { label: 'Approved', value: stats.approved },
    { label: 'Rejected', value: stats.rejected },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and manage visa applications, track their status, and process approvals."
        actions={
          <Select value={statusFilter ?? 'all'} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-44 rounded-lg border-brand-neutral-200 focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-ht-caption text-muted-foreground">
                {s.label}
              </span>
              <span className="font-display text-2xl font-bold tracking-tight">
                {s.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {isPending ? (
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Code', 'Client', 'Service', 'Status', 'Created', 'Updated', ''].map((h) => (
                  <th key={h} className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={Math.min(rows.length || 5, 5)} columns={7} />
            </tbody>
          </table>
        </div>
      ) : (
        <ApplicationsTable rows={rows} />
      )}

      <Pagination
        page={page}
        totalPages={lastPage}
        total={total}
        perPage={10}
        onChange={handlePageChange}
      />
    </div>
  )
}
