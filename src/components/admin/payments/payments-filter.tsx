'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Filters {
  code: string
  name: string
  method: string
  status: string
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  onReset: () => void
}

export default function PaymentFilters({ filters, onChange, onReset }: Props) {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end mb-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">Transaction Code</label>
        <input
          placeholder="TXN-00000"
          value={filters.code}
          onChange={(e) => set('code', e.target.value)}
          className="h-9 px-2.5 rounded-lg border border-brand-neutral-200 bg-white text-sm text-brand-neutral-900 outline-none focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10 transition-all placeholder:text-brand-neutral-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">Name</label>
        <input
          placeholder="Client name"
          value={filters.name}
          onChange={(e) => set('name', e.target.value)}
          className="h-9 px-2.5 rounded-lg border border-brand-neutral-200 bg-white text-sm text-brand-neutral-900 outline-none focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10 transition-all placeholder:text-brand-neutral-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">Payment Method</label>
        <Select value={filters.method} onValueChange={(v) => set('method', v)}>
          <SelectTrigger className="h-9 w-full rounded-lg border-brand-neutral-200 focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="ewallet">E-Wallet</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="retail_outlet">Retail Outlet</SelectItem>
            <SelectItem value="qr_code">QR Code</SelectItem>
            <SelectItem value="qris">QRIS</SelectItem>
            <SelectItem value="direct_debit">Direct Debit</SelectItem>
            <SelectItem value="paylater">Pay Later</SelectItem>
            <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
            <SelectItem value="pool">Pool</SelectItem>
            <SelectItem value="callback_virtual_account">Callback Virtual Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">Status</label>
        <Select value={filters.status} onValueChange={(v) => set('status', v)}>
          <SelectTrigger className="h-9 w-full rounded-lg border-brand-neutral-200 focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        onClick={onReset}
        className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-brand-primary-200 bg-brand-primary-50 text-sm text-brand-primary-600 font-medium hover:bg-brand-primary-100 transition-colors whitespace-nowrap"
      >
        <i className="ti ti-x text-sm" aria-hidden="true" />
        Clear
      </button>
    </div>
  )
}
