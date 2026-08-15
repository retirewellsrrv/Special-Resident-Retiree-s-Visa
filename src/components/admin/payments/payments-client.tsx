'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Download, Loader2, Banknote, Clock, CheckCircle2, Undo2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { FilterInput, FilterSelect, FilterClear, FilterBar } from '@/components/admin/shared/filters'
import PaymentTable from '@/components/admin/payments/payments-table'
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
  typeFilter?: string
  codeFilter?: string
  nameFilter?: string
  q?: string
}

export function PaymentsClient({ rows, total, stats, page, statusFilter, methodFilter, typeFilter, codeFilter, nameFilter, q }: Props) {
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
    navigate({ page: undefined, status: undefined, method: undefined, type: undefined, code: undefined, name: undefined, q: undefined })
  }

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const { rows: all } = await getPayments({ limit: 10000 })
      const headers = ['id', 'client_name', 'amount', 'status', 'service_type', 'payment_method', 'transaction_code', 'created_at']
      downloadCsv(all, headers, `payment-logs-${new Date().toISOString().slice(0, 10)}.csv`)
    } finally {
      setIsExporting(false)
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const refundRate = stats.total ? ((stats.refunded / stats.total) * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payment Logs"
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <Banknote className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Revenue</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{fmt(stats.revenue)}</p>
            <p className="text-[10px] text-brand-neutral-400 mt-1">
              App: {fmt(stats.revenueApplication)} · Consult: {fmt(stats.revenueConsultation)}
            </p>
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
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Successful</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{stats.success}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-red-50 text-red-600">
            <Undo2 className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[10px] font-medium text-brand-neutral-400 uppercase tracking-wider">Refunded</p>
            <p className="text-sm font-semibold text-brand-neutral-900 tabular-nums">{fmt(stats.refundAmt)}</p>
            <p className="text-[10px] text-brand-neutral-400">{refundRate}% rate</p>
          </div>
        </div>
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
        <FilterSelect
          label="Service Type"
          placeholder="All Services"
          value={typeFilter}
          options={[
            { value: 'application', label: 'Application' },
            { value: 'consultation', label: 'Consultation' },
          ]}
          onChange={(v) => navigate({ type: v !== 'all' ? v : undefined, page: '1' })}
          disabled={isPending}
        />
        <FilterClear onClick={handleClear} disabled={isPending} />
      </FilterBar>

      {/* Table stays mounted so the page height never changes; a contained
          spinner overlays it while the transition is pending. This avoids the
          layout/scroll jump that swapping in a taller skeleton caused. */}
      <div className="relative">
        <div
          className={
            isPending
              ? 'opacity-60 pointer-events-none transition-opacity duration-200'
              : 'transition-opacity duration-200'
          }
        >
          <PaymentTable
            rows={rows}
            total={total}
          />
        </div>
        {isPending && (
          <div
            role="status"
            aria-label="Loading transactions"
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60"
          >
            <div className="flex items-center gap-2 rounded-lg border border-brand-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-neutral-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-brand-primary-600" />
              Loading transactions...
            </div>
          </div>
        )}
      </div>

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
