'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox, ExternalLink } from 'lucide-react'
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
  service_type?: string
}

type SortKey = 'client_name' | 'amount' | 'status' | 'payment_method' | 'transaction_code' | 'created_at' | 'service_type'

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (ts: string | null) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'client_name', label: 'Client Name' },
  { key: 'transaction_code', label: 'Transaction Code' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'payment_method', label: 'Payment Type' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'created_at', label: 'Created At' },
]

interface Props {
  rows: PaymentWithName[]
  total: number
}

export default function PaymentTable({ rows, total }: Props) {
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
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <span className="text-sm font-medium text-brand-neutral-900">Recent Transactions</span>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden divide-y divide-brand-neutral-100">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-4">
            <Inbox className="size-10 text-brand-neutral-300" />
            <p className="text-sm text-brand-neutral-400">No transactions found</p>
            <a
              href="/admin/applications"
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> View Applications
            </a>
          </div>
        ) : (
          sorted.map((row) => (
            <div key={row.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-brand-neutral-900 font-medium truncate">{row.client_name ?? '\u2014'}</p>
                  <p className="font-mono text-xs text-brand-neutral-500 truncate">{row.transaction_code}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{fmt(row.amount)}</span>
                <span className="text-sm text-brand-neutral-600 capitalize">{row.payment_method}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={
                    row.service_type === 'application'
                      ? 'inline-flex rounded-md bg-brand-primary-50 text-brand-primary-800 px-2 py-0.5 text-xs font-medium capitalize'
                      : 'inline-flex rounded-md bg-violet-50 text-violet-700 px-2 py-0.5 text-xs font-medium capitalize'
                  }
                >
                  {row.service_type}
                </span>
                <span className="text-xs text-brand-neutral-500">{fmtDate(row.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Inbox className="size-10 text-brand-neutral-300" />
                  <p className="text-sm text-brand-neutral-400">No transactions found</p>
                  <a
                    href="/admin/applications"
                    className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> View Applications
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ) : sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-sm text-brand-neutral-900 font-medium">{row.client_name ?? '\u2014'}</TableCell>
              <TableCell className="font-mono text-xs text-brand-neutral-500">{row.transaction_code}</TableCell>
              <TableCell className="font-medium">{fmt(row.amount)}</TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell className="text-brand-neutral-600 capitalize">{row.payment_method}</TableCell>
              <TableCell>
                <span className={
                  row.service_type === 'application'
                    ? 'inline-flex rounded-md bg-brand-primary-50 text-brand-primary-800 px-2 py-0.5 text-xs font-medium capitalize'
                    : 'inline-flex rounded-md bg-violet-50 text-violet-700 px-2 py-0.5 text-xs font-medium capitalize'
                }>{row.service_type}</span>
              </TableCell>
              <TableCell className="text-xs text-brand-neutral-500">{fmtDate(row.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
