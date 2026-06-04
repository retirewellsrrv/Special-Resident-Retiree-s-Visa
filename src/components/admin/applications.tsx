'use client'

import { useActionState, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { updateAppStatus, type AppStats, type AppRow } from '@/actions/admin/applications-admin'

const STATUS_LABELS: Record<string, string> = {
  paused: 'Paused',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'> = {
  submitted: 'secondary',
  under_review: 'default',
  pending_documents: 'outline',
  approved: 'ghost',
  rejected: 'destructive',
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
  const [updateId, setUpdateId] = useState<number | null>(null)
  const lastPage = Math.max(1, Math.ceil(total / 10))

  const [state, formAction, pending] = useActionState(updateAppStatus, {
    error: null,
    success: false,
  })

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams()
      if (value && value !== 'all') params.set('status', value)
      router.push(`/admin/applications?${params.toString()}`)
    },
    [router],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(newPage))
      router.push(`/admin/applications?${params.toString()}`)
    },
    [router, statusFilter],
  )

  const statCards = [
    { label: 'Total', value: stats.total },
    { label: 'Paused', value: stats.paused },
    { label: 'Processing', value: stats.processing },
    { label: 'Approved', value: stats.approved },
    { label: 'Rejected', value: stats.rejected },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
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

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-ht-headline-md">Applications</h1>
        <Select value={statusFilter ?? 'all'} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-44">
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
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-ht-body-md text-muted-foreground"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-ht-caption">
                    {row.application_code}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-ht-body-md">{row.service_type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[row.status] ?? 'outline'}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ht-caption text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-ht-caption text-muted-foreground">
                    {new Date(row.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setUpdateId(row.id)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {total > 10 && (
        <div className="flex items-center justify-between text-ht-body-md text-muted-foreground">
          <p>
            Page {page} of {lastPage} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {updateId !== null && (
        <Dialog open onOpenChange={(open) => { if (!open) setUpdateId(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display">
                <FileText className="size-4" />
                Update Status
              </DialogTitle>
              <DialogDescription>
                Change the application status. This will notify the applicant.
              </DialogDescription>
            </DialogHeader>

            <form action={formAction}>
              {state.error && (
                <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-ht-body-md text-destructive">
                  {state.error}
                </p>
              )}
              <input type="hidden" name="app_id" value={updateId} />

              <label className="mb-1 block text-ht-label-md text-foreground">
                New status
              </label>
              <select
                name="status"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-ht-body-md transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select status
                </option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Updating\u2026' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
