'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Pencil } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import StatusBadge from './payments-status-badge'
type PaymentWithName = {
  id: number
  amount: number
  status: string
  payment_method: string
  transaction_code: string
  created_at: string | null
  client_name?: string
}

type SortKey = 'id' | 'client_name' | 'amount' | 'status' | 'payment_method' | 'transaction_code' | 'created_at'

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (ts: string | null) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'client_name', label: 'Client Name' },
  { key: 'transaction_code', label: 'Transaction Code' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'payment_method', label: 'Payment Type' },
  { key: 'created_at', label: 'Created At' },
]

interface Props {
  rows: PaymentWithName[]
  total: number
  onView?: (row: PaymentWithName) => void
  onEdit?: (row: PaymentWithName) => void
}

export default function PaymentTable({ rows, total, onView, onEdit }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'amount') {
        cmp = a.amount - b.amount
      } else {
        const key = sortKey as keyof PaymentWithName
        const va = a[key]
        const vb = b[key]
        if (va == null && vb == null) cmp = 0
        else if (va == null) cmp = 1
        else if (vb == null) cmp = -1
        else if (va < vb) cmp = -1
        else if (va > vb) cmp = 1
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-brand-neutral-300" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  return (
    <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-neutral-100">
        <span className="text-sm font-medium text-brand-neutral-900">Recent Transactions</span>
        <span className="text-xs text-brand-neutral-500">{rows.length} of {total} records</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableHead
                key={c.key}
                className="cursor-pointer select-none hover:text-brand-neutral-600"
                onClick={() => toggleSort(c.key)}
              >
                {c.label}
                <SortIcon column={c.key} />
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length + 1} className="text-center text-brand-neutral-400 py-12">
                No transactions found
              </TableCell>
            </TableRow>
          ) : sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs text-brand-neutral-500">{row.id}</TableCell>
              <TableCell className="text-sm text-brand-neutral-900 font-medium">{row.client_name ?? '\u2014'}</TableCell>
              <TableCell className="font-mono text-xs text-brand-neutral-500">{row.transaction_code}</TableCell>
              <TableCell className="font-medium">{fmt(row.amount)}</TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell className="text-brand-neutral-600 capitalize">{row.payment_method}</TableCell>
              <TableCell className="text-xs text-brand-neutral-500">{fmtDate(row.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView?.(row)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 hover:text-brand-neutral-700 transition-colors"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onEdit?.(row)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 hover:text-brand-neutral-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
