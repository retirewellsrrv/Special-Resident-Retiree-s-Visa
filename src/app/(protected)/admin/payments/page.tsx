'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Plus } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/loading'
import { PageHeader } from '@/components/admin/shared/page-header'
import PaymentFilters from '@/components/admin/payments/payments-filter'
import PaymentTable from '@/components/admin/payments/payments-table'
import StatCard from '@/components/admin/payments/payments-stats-card'
import { Pagination } from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/client'
import { downloadCsv } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentWithName = Payment & { client_name?: string }

const supabase = createClient()
const PER_PAGE = 10

const EMPTY_FILTERS = { code: '', name: '', method: 'all', status: 'all' }

const fmt = (n: number) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PaymentLogsPage() {
  const [rows, setRows] = useState<PaymentWithName[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [globalSearch, setGlobalSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ revenue: 0, pending: 0, success: 0, refunded: 0, refundAmt: 0, total: 0 })

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('payments').select('status, amount')
    if (!data) return
    const all = data as { status: string; amount: number }[]
    const completed = all.filter((r) => r.status === 'success')
    const refunded = all.filter((r) => r.status === 'cancelled')
    setStats({
      revenue: completed.reduce((a, r) => a + Number(r.amount), 0),
      pending: all.filter((r) => r.status === 'pending').length,
      success: completed.length,
      refunded: refunded.length,
      refundAmt: refunded.reduce((a, r) => a + Number(r.amount), 0),
      total: all.length,
    })
  }, [])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('payments')
      .select('*, client_profiles!payments_user_id_fkey(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

    if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status as Database['public']['Enums']['payment_status'])
    if (filters.method && filters.method !== 'all') q = q.eq('payment_method', filters.method as Database['public']['Enums']['payment_methods'])
    if (filters.code) q = q.ilike('transaction_code', `%${filters.code}%`)
    if (filters.name) q = q.ilike('client_profiles.name', `%${filters.name}%`)
    if (globalSearch) q = q.or(
      `transaction_code.ilike.%${globalSearch}%,client_profiles.name.ilike.%${globalSearch}%,payment_method.ilike.%${globalSearch}%`
    )

    const { data, count } = await q
    const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
      ...(row as Payment),
      client_name: ((row as Record<string, unknown>).client_profiles as Record<string, unknown> | null)?.name as string | undefined,
    }))
    setRows(mapped)
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, filters, globalSearch])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchRows() }, [fetchRows])

  const handleFiltersChange = (next: { code: string; name: string; method: string; status: string }) => { setFilters(next); setPage(1) }
  const handleReset = () => { setFilters(EMPTY_FILTERS); setGlobalSearch(''); setPage(1) }
  const handleSearch = (val: string) => { setGlobalSearch(val); setPage(1) }

  const handleExport = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*, client_profiles!payments_user_id_fkey(name)')
      .order('created_at', { ascending: false })
    if (!data) return
    const mapped = data.map((r) => {
      const row = r as Record<string, unknown>
      const profiles = row.client_profiles as Record<string, unknown> | null
      return { ...row, client_name: profiles?.name ?? '' }
    })
    const headers = ['id', 'client_name', 'amount', 'status', 'payment_method', 'transaction_code', 'created_at']
    downloadCsv(mapped, headers, `payment-logs-${new Date().toISOString().slice(0, 10)}.csv`)
  }

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
            <button className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors">
              <Plus className="h-4 w-4" />
              Create New Case
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          label="Total Revenue"
          icon="ti-cash"
          value={fmt(stats.revenue)}
          barWidth={78}
          barColor="#871426"
          footer={<><span className="text-green-600 font-medium">↑8.2%</span> from last month</>}
        />
        <StatCard
          label="Pending Payments"
          icon="ti-clock"
          value={stats.pending}
          barWidth={stats.total ? (stats.pending / stats.total) * 100 : 0}
          barColor="#d97706"
          footer={`${stats.pending} application${stats.pending !== 1 ? 's' : ''} awaiting deposit`}
        />
        <StatCard
          label="Successful Txns"
          icon="ti-check"
          value={stats.success}
          barWidth={stats.total ? (stats.success / stats.total) * 100 : 0}
          barColor="#16a34a"
          footer="Prior year 2024 baseline"
        />
        <StatCard
          label="Refunds Issued"
          icon="ti-refresh"
          value={fmt(stats.refundAmt)}
          barWidth={stats.total ? (stats.refunded / stats.total) * 100 : 0}
          barColor="#a6192e"
          footer={<><span className="text-red-600 font-medium">{refundRate}%</span> refund rate</>}
        />
      </div>

      <div className="space-y-3">
        <PaymentFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleReset}
        />
      </div>

      {loading ? (
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-neutral-100">
            <span className="text-sm font-medium text-brand-neutral-900">Recent Transactions</span>
            <span className="text-xs text-brand-neutral-500">Loading\u2026</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['ID', 'Client Name', 'Transaction Code', 'Amount', 'Status', 'Payment Type', 'Created At', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={5} columns={8} />
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

      {!loading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={PER_PAGE}
          onChange={setPage}
        />
      )}
    </div>
  )
}
