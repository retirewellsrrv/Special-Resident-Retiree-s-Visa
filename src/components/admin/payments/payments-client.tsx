'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Download, Plus, Wallet, Clock, CheckCircle2, RotateCcw } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/loading'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import PaymentTable from '@/components/admin/payments/payments-table'
import { StatCard } from '@/components/admin/shared/stat-card'
import { Pagination } from '@/components/ui/pagination'
import { downloadCsv } from '@/lib/utils'
import { getPayments } from '@/actions/admin/payments'
import type { PaymentRow, PaymentStats } from '@/actions/admin/payments'

const PER_PAGE = 10

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface Props {
  rows: PaymentRow[]
  total: number
  stats: PaymentStats
  page: number
  statusFilter?: string
  methodFilter?: string
  codeFilter?: string
  nameFilter?: string
  q?: string
}

export function PaymentsClient({ rows, total, stats, page, statusFilter, methodFilter, codeFilter, nameFilter, q }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function navigate(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      v ? next.set(k, v) : next.delete(k)
    })
    startTransition(() => router.push(`${pathname}?${next}`))
  }

  function handleClear() {
    navigate({ page: undefined, status: undefined, method: undefined, code: undefined, name: undefined, q: undefined })
  }

  const handleExport = useCallback(async () => {
    const { rows: all } = await getPayments({ limit: 10000 })
    const headers = ['id', 'client_name', 'amount', 'status', 'payment_method', 'transaction_code', 'created_at']
    downloadCsv(all, headers, `payment-logs-${new Date().toISOString().slice(0, 10)}.csv`)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const refundRate = stats.total ? ((stats.refunded / stats.total) * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payment Logs"
        description="Monitor and manage all financial transactions related to SRRV applications, including government payments and service fees."
        actions={
          <>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => router.push('/admin/applications')}
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Case
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          icon={Wallet}
          label="Total Revenue"
          value={fmt(stats.revenue)}
          barWidth={78}
          barColor="#871426"
          footer={<><span className="text-green-600 font-medium">↑8.2%</span> from last month</>}
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={stats.pending}
          barWidth={stats.total ? (stats.pending / stats.total) * 100 : 0}
          barColor="#d97706"
          footer={`${stats.pending} application${stats.pending !== 1 ? 's' : ''} awaiting deposit`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Successful Txns"
          value={stats.success}
          barWidth={stats.total ? (stats.success / stats.total) * 100 : 0}
          barColor="#16a34a"
          footer="Prior year 2024 baseline"
        />
        <StatCard
          icon={RotateCcw}
          label="Refunds Issued"
          value={fmt(stats.refundAmt)}
          barWidth={stats.total ? (stats.refunded / stats.total) * 100 : 0}
          barColor="#a6192e"
          footer={<><span className="text-red-600 font-medium">{refundRate}%</span> refund rate</>}
        />
      </div>

      <FilterBar>
        <FilterInput
          label="Transaction Code"
          placeholder="TXN-00000"
          defaultValue={codeFilter ?? ''}
          onChange={(v) => navigate({ code: v || undefined, page: '1' })}
          disabled={isPending}
          isPending={isPending}
          debounceMs={400}
        />
        <FilterInput
          label="Name"
          placeholder="Client name"
          defaultValue={nameFilter ?? ''}
          onChange={(v) => navigate({ name: v || undefined, page: '1' })}
          disabled={isPending}
          isPending={isPending}
          debounceMs={400}
        />
        <FilterSelect
          label="Payment Method"
          placeholder="All Methods"
          value={methodFilter}
          options={[
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'ewallet', label: 'E-Wallet' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'retail_outlet', label: 'Retail Outlet' },
            { value: 'qr_code', label: 'QR Code' },
            { value: 'qris', label: 'QRIS' },
            { value: 'direct_debit', label: 'Direct Debit' },
            { value: 'paylater', label: 'Pay Later' },
            { value: 'cryptocurrency', label: 'Cryptocurrency' },
            { value: 'pool', label: 'Pool' },
            { value: 'callback_virtual_account', label: 'Callback Virtual Account' },
          ]}
          onChange={(v) => navigate({ method: v !== 'all' ? v : undefined, page: '1' })}
          disabled={isPending}
        />
        <FilterSelect
          label="Status"
          placeholder="All Status"
          value={statusFilter}
          options={[
            { value: 'success', label: 'Success' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          onChange={(v) => navigate({ status: v !== 'all' ? v : undefined, page: '1' })}
          disabled={isPending}
        />
        <FilterClear onClick={handleClear} disabled={isPending} />
      </FilterBar>

      {isPending ? (
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-neutral-100">
            <span className="text-sm font-medium text-brand-neutral-900">Recent Transactions</span>
            <span className="text-xs text-brand-neutral-500">Loading\u2026</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Client Name', 'Transaction Code', 'Amount', 'Status', 'Payment Type', 'Created At', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={5} columns={7} />
            </tbody>
          </table>
        </div>
      ) : (
        <PaymentTable
          rows={rows}
          total={total}
          onView={(row) => console.log('view', row)}
          onEdit={(row) => console.log('edit', row)}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={PER_PAGE}
        onChange={(p) => navigate({ page: String(p) })}
        disabled={isPending}
      />
    </div>
  )
}
