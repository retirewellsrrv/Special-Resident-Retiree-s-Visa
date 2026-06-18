'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApplicationStatusBadge } from './applications-status-badge'
import { updateAppStatus } from '@/actions/admin/applications-admin'
import type { AppRow } from '@/actions/admin/applications-admin'

const STATUS_LABELS: Record<string, string> = {
  paused: 'Paused',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface Props {
  rows: AppRow[]
}

export function ApplicationsTable({ rows }: Props) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleStatusChange = useCallback(
    async (appId: number, newStatus: string) => {
      setUpdatingId(appId)
      const formData = new FormData()
      formData.set('app_id', String(appId))
      formData.set('status', newStatus)
      await updateAppStatus({ error: null, success: false }, formData)
      setUpdatingId(null)
      router.refresh()
    },
    [router],
  )

  return (
    <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-40">Action</TableHead>
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
              <TableCell>
                <span className="capitalize">{row.service_plan_name ?? row.service_type}</span>
              </TableCell>
              <TableCell>
                <ApplicationStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-ht-caption text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-ht-caption text-muted-foreground">
                {new Date(row.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Select
                  value={row.status}
                  onValueChange={(v) => handleStatusChange(row.id, v)}
                  disabled={updatingId === row.id}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
