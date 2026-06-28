'use client'

import { useActionState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
    resolveReview,
    type ClientRow,
    type ClientStats,
    type ActionState,
} from '@/actions/admin/client-profiles'
import { Badge } from '@/components/ui/badge'
import { StatusChip } from '@/components/ui/status-chip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TableSkeleton } from '@/components/ui/loading'
import {
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    PauseCircle,
    AlertTriangle,
    Eye,
    RotateCcw,
    type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Pagination } from '@/components/ui/pagination'

const SERVICE_TYPES = ['basic', 'premium', 'vip'] as const

const STATUS_ICON: Record<string, LucideIcon> = {
    approved: CheckCircle2,
    paused: PauseCircle,
    pending: Clock,
    rejected: XCircle,
}

function initials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function StatCard({
    label,
    value,
    badge,
    highlight,
    icon: Icon,
}: {
    label: string
    value: number
    badge?: string
    highlight?: boolean
    icon: LucideIcon
}) {
    return (
        <Card className={` rounded-2xl border border-neutral-200 shadow-sm bg-white p-5 space-y-4 transition-shadow hover:shadow-md ${highlight ? 'ring-brand-primary-200' : ''}`}>
            <div className="flex items-start justify-between">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-brand-primary-100 text-brand-primary-600' : 'bg-primary/10 text-primary'
                        }`}
                >
                    <Icon className="w-5 h-5" />
                </div>
                {badge && (
                    <Badge variant={highlight ? 'destructive' : 'secondary'} className="font-medium">
                        {badge}
                    </Badge>
                )}
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-bold mt-0.5 tabular-nums">{value.toLocaleString()}</p>
            </div>
        </Card>
    )
}

const initialState: ActionState = { error: null, success: false }

function ClientDirectoryRow({ row }: { row: ClientRow }) {
    const [state, formAction, pending] = useActionState(resolveReview, initialState)
    const needsReview = row.status === 'pending_documents'
    const StatusIcon = STATUS_ICON[row.status]

    return (
        <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {initials(row.name)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.application_code}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4 text-sm capitalize">{row.service_plan_name ?? row.service_type}</td>
            <td className="py-4 pr-4">
                <StatusChip status={row.status} icon={StatusIcon} />
            </td>
            <td className="py-4 pr-4 text-sm text-muted-foreground">
                {row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })
                    : '\u2014'}
            </td>
            <td className="py-4">
                {needsReview ? (
                    <form action={formAction} className="flex items-center gap-2">
                        <input type="hidden" name="user_id" value={row.user_id} />
                        <button
                            type="submit"
                            disabled={pending}
                            className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-50 text-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                        >
                            {pending ? 'Resolving\u2026' : 'Resolve'}
                        </button>
                        {state.error && <p className="text-xs text-brand-primary-500">{state.error}</p>}
                    </form>
                ) : (
                    <button className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                    </button>
                )}
            </td>
        </tr>
    )
}

export function ClientProfilesClient({
    stats,
    rows,
    total,
    page,
    filter,
    serviceType,
}: {
    stats: ClientStats
    rows: ClientRow[]
    total: number
    page: number
    filter: 'all' | 'new'
    serviceType?: string
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

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Client Profiles"
                description="Manage and review existing clients, track application history, and coordinate with the visa processing department for ongoing cases."
                actions={
                    <>
                        <button className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors">
                            Export CSV
                        </button>
                        <button className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors">
                            + Add New Client
                        </button>
                    </>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Clients" value={stats.total} badge="+12%" icon={Users} />
                <StatCard label="Pending" value={stats.pending} icon={Clock} />
                <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} />
                <StatCard
                    label="Rejected"
                    value={stats.rejected}
                    badge="High Priority"
                    highlight
                    icon={AlertTriangle}
                />
            </div>

            {/* Client Directory */}
            <Card
                className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold mr-3">Client Directory</h2>
                        {(['all', 'new'] as const).map((f) => (
                            <button
                                key={f}
                                disabled={isPending}
                                onClick={() => navigate({ filter: f, page: '1' })}
                                className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-md px-3 py-1.5 transition-colors disabled:opacity-50 ${filter === f
                                    ? 'bg-red-800 text-red-50'
                                    : 'border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50'
                                    }`}
                            >
                                {f === 'all' ? 'All Clients' : 'New (30d)'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={serviceType ?? ''}
                            onValueChange={(v) => navigate({ service_type: v || undefined, page: '1' })}
                        >
                            <SelectTrigger className="text-xs h-8 w-44" disabled={isPending}>
                                <SelectValue placeholder="Filter by Service Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICE_TYPES.map((v) => (
                                    <SelectItem key={v} value={v} className="capitalize">
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <button
                            disabled={isPending}
                            onClick={() => navigate({ filter: 'all', service_type: undefined, page: '1' })}
                            title="Reset filters"
                            aria-label="Reset filters"
                            className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <Separator />

                {/* Table */}
                <div className="overflow-x-auto px-5">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                {['Client Name & ID', 'Service Type', 'Status', 'Last Updated', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isPending ? (
                                <TableSkeleton rows={Math.min(rows.length || limit, limit)} columns={5} />
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => <ClientDirectoryRow key={row.user_id} row={row} />)
                            )}
                        </tbody>
                    </table>
                </div>

            </Card>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                perPage={limit}
                onChange={(p) => navigate({ page: String(p) })}
                maxVisiblePages={3}
            />
        </div>
    )
}