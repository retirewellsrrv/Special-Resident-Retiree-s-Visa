'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    type ClientRow,
    type ClientStats,
    getClientDirectory,
} from '@/actions/admin/client-profiles'
import { StatusChip } from '@/components/ui/status-chip'
import { TableSkeleton } from '@/components/ui/loading'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import { downloadCsv } from '@/lib/utils'
import {
    Download,
    Inbox,
    Loader2,
    UserRound,
    Clock,
    CheckCircle2,
    XCircle,
    PauseCircle,
    AlertTriangle,
    Eye,
    Plus,
    type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Pagination } from '@/components/ui/pagination'

const STATUS_ICON: Record<string, LucideIcon> = {
    approved: CheckCircle2,
    paused: PauseCircle,
    pending: Clock,
    rejected: XCircle,
}

function ClientDirectoryRow({ row }: { row: ClientRow }) {
    const StatusIcon = STATUS_ICON[row.status]

    return (
        <TableRow>
            <TableCell>
                <div>
                    <p className="text-sm font-semibold leading-tight text-brand-neutral-900">{row.name}</p>
                    <p className="text-xs text-brand-neutral-500">{row.application_code}</p>
                </div>
            </TableCell>
            <TableCell>
                <StatusChip status={row.status} icon={StatusIcon} />
            </TableCell>
            <TableCell className="text-sm text-brand-neutral-500">
                {row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })
                    : '\u2014'}
            </TableCell>
            <TableCell className="text-right">
                <Link
                    href={`/admin/applications?userId=${row.user_id}`}
                    className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Review Application
                </Link>
            </TableCell>
        </TableRow>
    )
}

export function ClientProfilesClient({
    stats: _stats,
    rows,
    total,
    page,
    filter,
    statusFilter,
    q,
    applicationCode,
}: {
    stats: ClientStats
    rows: ClientRow[]
    total: number
    page: number
    filter: 'all' | 'new'
    statusFilter?: string
    q?: string
    applicationCode?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const limit = 10
    const totalPages = Math.ceil(total / limit)

    function navigate(params: Record<string, string | undefined>) {
        const next = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([k, v]) => {
            v ? next.set(k, v) : next.delete(k)
        })
        startTransition(() => router.push(`${pathname}?${next}`))
    }

    const [isExporting, setIsExporting] = useState(false)

    const handleExport = useCallback(async () => {
        setIsExporting(true)
        try {
            const { rows: all } = await getClientDirectory({ limit: 10000 })
            const headers = ['user_id', 'name', 'application_code', 'status', 'updated_at']
            downloadCsv(all, headers, `client-profiles-${new Date().toISOString().slice(0, 10)}.csv`)
        } finally {
            setIsExporting(false)
        }
    }, [])

    function handleClear() {
        navigate({ filter: 'all', status: undefined, q: undefined, application_code: undefined, page: '1' })
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Manage Client Profiles"
                actions={
                    <>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </>
                }
            />

            {/* Compact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <UserRound className="size-4" />
                    </div>
                    <div className="min-w-0 leading-none">
                        <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Total Clients</p>
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

            {/* Filters */}
            <FilterBar>
                <FilterInput
                    label="Application ID"
                    placeholder="APP-00000"
                    defaultValue={applicationCode ?? ''}
                    onChange={(v) => navigate({ application_code: v || undefined, page: '1' })}
                    disabled={isPending}
                    isPending={isPending}
                    debounceMs={400}
                />
                <FilterInput
                    label="Name"
                    placeholder="Client name"
                    defaultValue={q ?? ''}
                    onChange={(v) => navigate({ q: v || undefined, page: '1' })}
                    disabled={isPending}
                    isPending={isPending}
                    debounceMs={400}
                />
                <FilterSelect
                    label="Status"
                    placeholder="All Status"
                    value={statusFilter}
                    options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                        { value: 'paused', label: 'Paused' },
                    ]}
                    onChange={(v) => navigate({ status: v !== 'all' ? v : undefined, page: '1' })}
                    disabled={isPending}
                />
                <FilterClear onClick={handleClear} disabled={isPending} />
            </FilterBar>

            {/* Table */}
            <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-brand-neutral-100">
                    <span className="text-sm font-medium text-brand-neutral-900">Client Records</span>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                            <TableSkeleton rows={Math.min(rows.length || limit, limit)} columns={4} />
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <Inbox className="size-10 text-brand-neutral-300" />
                                        <p className="text-sm text-brand-neutral-400">No clients found.</p>
                                        <Link
                                            href="/admin/applications"
                                            className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" /> View Applications
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => <ClientDirectoryRow key={row.user_id} row={row} />)
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                perPage={limit}
                onChange={(p) => navigate({ page: String(p) })}
                maxVisiblePages={3}
                disabled={isPending}
            />
        </div>
    )
}