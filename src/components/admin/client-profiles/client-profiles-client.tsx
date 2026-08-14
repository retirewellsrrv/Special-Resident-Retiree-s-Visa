'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    type ClientRow,
    type ClientStats,
} from '@/actions/admin/client-profiles'
import { StatusChip } from '@/components/ui/status-chip'
import { TableSkeleton } from '@/components/ui/loading'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import {
    Inbox,
    UserRound,
    Clock,
    CheckCircle2,
    XCircle,
    PauseCircle,
    AlertTriangle,
    ChevronRight,
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
    const StatusIcon = row.status ? STATUS_ICON[row.status] : undefined
    const href = `/admin/profiles/${row.user_id}`
    const rowLinkProps = {
        href,
        className: 'contents focus-visible:outline-2 focus-visible:outline-brand-primary-500 rounded-sm',
    }

    return (
        <TableRow className="group cursor-pointer">
            <TableCell>
                <Link {...rowLinkProps}>
                    <p className="text-sm font-semibold leading-tight text-brand-neutral-900">{row.name}</p>
                    <p className="text-xs text-brand-neutral-500">
                        {row.application_code ?? 'No application yet'}
                    </p>
                </Link>
            </TableCell>
            <TableCell>
                <Link {...rowLinkProps}>
                    {row.status ? (
                        <StatusChip status={row.status} icon={StatusIcon} />
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-neutral-200 bg-brand-neutral-100 text-brand-neutral-600 capitalize">
                            No Application
                        </span>
                    )}
                </Link>
            </TableCell>
            <TableCell className="text-sm text-brand-neutral-500">
                <Link {...rowLinkProps}>
                    {row.updated_at
                        ? new Date(row.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '\u2014'}
                </Link>
            </TableCell>
            <TableCell className="text-right">
                <Link {...rowLinkProps} aria-label={`View profile of ${row.name}`}>
                    <ChevronRight className="ml-auto h-4 w-4 text-brand-neutral-300 transition-all group-hover:text-brand-neutral-600 group-hover:translate-x-0.5" />
                </Link>
            </TableCell>
        </TableRow>
    )
}

export function ClientProfilesClient({
    stats,
    rows,
    total,
    page,
    statusFilter,
    q,
}: {
    stats: ClientStats
    rows: ClientRow[]
    total: number
    page: number
    statusFilter?: string
    q?: string
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

    function handleClear() {
        navigate({ status: undefined, q: undefined, page: '1' })
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Manage Client Profiles" />

            {/* Compact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <UserRound className="size-4" />
                    </div>
                    <div className="min-w-0 leading-none">
                        <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Total Clients</p>
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

            {/* Filters */}
            <FilterBar>
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
                            <TableHead className="text-right">
                                <span className="sr-only">Open profile</span>
                            </TableHead>
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