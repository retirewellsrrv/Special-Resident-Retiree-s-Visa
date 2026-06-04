'use client'

import { useActionState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { resolveReview, type ClientRow, type ClientStats, type ActionState } from '@/actions/admin/client-profiles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SERVICE_TYPES = ['basic', 'premium', 'vip'] as const

const STATUS_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    paused: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-700',
}

const STATUS_DOT: Record<string, string> = {
    approved: 'bg-green-500',
    paused: 'bg-blue-400',
    processing: 'bg-purple-400',
    rejected: 'bg-red-500',
}

function initials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function StatCard({ label, value, badge, highlight }: {
    label: string; value: number; badge?: string; highlight?: boolean
}) {
    return (
        <Card className={`p-5 space-y-3 ${highlight ? 'border-red-300' : ''}`}>
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${highlight ? 'bg-red-100' : 'bg-muted'}`}>
                    {highlight ? '\u26A0\uFE0F' : '\uD83D\uDC65'}
                </div>
                {badge && (
                    <Badge variant={highlight ? 'destructive' : 'secondary'}>
                        {badge}
                    </Badge>
                )}
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-bold mt-0.5">{value.toLocaleString()}</p>
            </div>
        </Card>
    )
}

const initialState: ActionState = { error: null, success: false }

function ClientDirectoryRow({ row }: { row: ClientRow }) {
    const [state, formAction, pending] = useActionState(resolveReview, initialState)
    const needsReview = row.status === 'pending_documents'

    return (
        <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {initials(row.name)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.application_code}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4 text-sm capitalize">{row.service_type}</td>
            <td className="py-4 pr-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[row.status] ?? 'bg-gray-400'}`} />
                    {row.status.replace(/_/g, ' ')}
                </span>
            </td>
            <td className="py-4 pr-4 text-sm text-muted-foreground">
                {row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '\u2014'}
            </td>
            <td className="py-4">
                {needsReview ? (
                    <form action={formAction}>
                        <input type="hidden" name="user_id" value={row.user_id} />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={pending}
                        >
                            {pending ? 'Resolving\u2026' : 'Resolve'}
                        </Button>
                        {state.error && <p className="text-xs text-red-500 mt-1">{state.error}</p>}
                    </form>
                ) : (
                    <Button variant="outline" size="sm">
                        View Details
                    </Button>
                )}
            </td>
        </tr>
    )
}

export function ClientProfilesClient({
    stats, rows, total, page, filter, serviceType,
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
    const [, startTransition] = useTransition()
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
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Client Profiles</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        Manage and review existing clients, track application history, and coordinate
                        with the visa processing department for ongoing cases.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                    <Button>+ Add New Client</Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Clients" value={stats.total} badge="+12%" />
                <StatCard label="Processing" value={stats.processing} />
                <StatCard label="Approved" value={stats.approved} />
                <StatCard label="Rejected" value={stats.rejected} badge="High Priority" highlight />
            </div>

            {/* Client Directory */}
            <Card>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold mr-3">Client Directory</h2>
                        {(['all', 'new'] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => navigate({ filter: f, page: '1' })}
                            >
                                {f === 'all' ? 'All Clients' : 'New (30d)'}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={serviceType ?? ''}
                            onValueChange={(v) => navigate({ service_type: v || undefined, page: '1' })}
                        >
                            <SelectTrigger className="text-xs h-8 w-44">
                                <SelectValue placeholder="Filter by Service Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICE_TYPES.map((v) => (
                                    <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ filter: 'all', service_type: undefined, page: '1' })}
                            title="Reset filters"
                        >
                            {'\u21BA'}
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Table */}
                <div className="overflow-x-auto px-5">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                {['Client Name & ID', 'Service Type', 'Status', 'Last Updated', 'Actions'].map((h) => (
                                    <th key={h} className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
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

                <Separator />

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Showing {rows.length} of {total.toLocaleString()} clients
                    </p>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={page <= 1}
                            onClick={() => navigate({ page: String(page - 1) })}>{'\u2039'}</Button>
                        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={page === p ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => navigate({ page: String(p) })}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button variant="outline" size="sm" disabled={page >= totalPages}
                            onClick={() => navigate({ page: String(page + 1) })}>{'\u203A'}</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
