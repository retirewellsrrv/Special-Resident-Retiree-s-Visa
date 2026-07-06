'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileIcon, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { StatusChip } from '@/components/ui/status-chip'
import { updateAppStatus } from '@/actions/admin/applications-admin'
import type { AppDetail } from '@/actions/admin/applications-admin'

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  visa: 'Visa',
  nbi: 'NBI Clearance',
  pension: 'Pension Proof',
  medical: 'Medical Report',
}

interface Props {
  detail: AppDetail
  onStatusChange: () => void
}

export function ApplicationDetail({ detail, onStatusChange }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedAppStatus, setSelectedAppStatus] = useState(detail.status)

  useEffect(() => {
    setSelectedAppStatus(detail.status)
  }, [detail.id, detail.status])

  const handleAppStatus = (status: string) => {
    const formData = new FormData()
    formData.set('app_id', String(detail.id))
    formData.set('status', status)
    startTransition(async () => {
      const result = await updateAppStatus({ error: null, success: false }, formData)
      if (!result.success && result.error) { toast.error(result.error); return }
      toast.success(`Application ${status}`)
      onStatusChange()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-5 py-4 border-b border-brand-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-neutral-900">{detail.applicant_name}</h3>
          <p className="text-xs text-brand-neutral-400 mt-0.5">
            {detail.application_code} &middot;{' '}
            <span className="capitalize">{detail.service_type}</span>
          </p>
        </div>
        <StatusChip status={detail.status} />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        <section className="px-5 py-4 space-y-3">
          <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Contact Information</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <InfoRow label="Phone" value={detail.phone_number} />
            <InfoRow label="Street" value={detail.street} />
            <InfoRow label="City" value={detail.city} />
            <InfoRow label="State/Province" value={detail.state} />
            <InfoRow label="Country" value={detail.country} />
            <InfoRow label="ZIP" value={detail.zip} />
            {detail.ph_address && <InfoRow label="PH Address" value={detail.ph_address} className="col-span-2" />}
          </div>
        </section>

        {(detail.emergency_name || detail.emergency_phone || detail.emergency_relationship) && (
          <section className="px-5 py-4 space-y-3">
            <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Emergency Contact</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {detail.emergency_name && <InfoRow label="Name" value={detail.emergency_name} />}
              {detail.emergency_phone && <InfoRow label="Phone" value={detail.emergency_phone} />}
              {detail.emergency_relationship && <InfoRow label="Relationship" value={detail.emergency_relationship} />}
            </div>
          </section>
        )}

        <section className="px-5 py-4 space-y-3">
          <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Service Plan</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <InfoRow label="Plan" value={detail.service_plan_name ?? detail.service_type} className="capitalize" />
            {detail.service_plan_price !== null && (
              <InfoRow label="Price" value={`$${Number(detail.service_plan_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
            )}
          </div>
        </section>

        {detail.payment && (
          <section className="px-5 py-4 space-y-3">
            <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Payment</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow label="Transaction Code" value={detail.payment.transaction_code} />
              <InfoRow label="Amount" value={`$${Number(detail.payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Method" value={detail.payment.payment_method} className="capitalize" />
              <InfoRow
                label="Status"
                value={detail.payment.status.charAt(0).toUpperCase() + detail.payment.status.slice(1)}
              />
              <InfoRow
                label="Paid At"
                value={new Date(detail.payment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              />
            </div>
          </section>
        )}

        <section className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">
              Documents ({detail.documents.length})
            </h4>
            <button
              onClick={() => router.push(`/admin/documents?userId=${detail.user_id}`)}
              className="inline-flex items-center gap-1.5 text-brand-primary-600 hover:text-brand-primary-800 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Review Docs
            </button>
          </div>
          {detail.documents.length === 0 ? (
            <p className="text-sm text-brand-neutral-400">No documents submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {detail.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-brand-neutral-200 px-3 py-2.5"
                >
                  <FileIcon className="h-5 w-5 text-brand-neutral-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900 truncate">
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </p>
                    <p className="text-xs text-brand-neutral-400 truncate">{doc.name}</p>
                  </div>
                  <StatusChip status={doc.status} className="shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="px-5 py-4 space-y-3">
          <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Application Status</h4>
          <div className="flex items-center gap-2">
            <select
              value={selectedAppStatus}
              onChange={(e) => setSelectedAppStatus(e.target.value)}
              disabled={isPending}
              aria-label="Application status"
              className="text-sm rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paused">Paused</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => handleAppStatus(selectedAppStatus)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="text-brand-neutral-400">{label}:</span>{' '}
      <span className="text-brand-neutral-900">{value}</span>
    </div>
  )
}
