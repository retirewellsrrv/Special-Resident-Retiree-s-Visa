'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileIcon, ExternalLink, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { StatusChip } from '@/components/ui/status-chip'
import { updateAppStatus } from '@/actions/admin/applications-admin'
import { DocumentReviewModal } from './document-review-modal'
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

  // Document review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewDocIndex, setReviewDocIndex] = useState(0)

  // Local shadow of doc statuses — updated instantly when a review is saved
  // so the document list reflects the change without waiting for a refresh.
  const [localDocStatuses, setLocalDocStatuses] = useState<Record<number, string>>({})

  useEffect(() => {
    setSelectedAppStatus(detail.status)
    setLocalDocStatuses({})
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

  const openDocReview = useCallback((index: number) => {
    setReviewDocIndex(index)
    setReviewModalOpen(true)
  }, [])

  const handleDocumentsUpdated = useCallback((docId: number, newStatus: string) => {
    setLocalDocStatuses((prev) => ({ ...prev, [docId]: newStatus }))
    onStatusChange()
    router.refresh()
  }, [onStatusChange, router])

  const someDocsNeedReview = detail.documents.some(
    (d) => {
      const status = localDocStatuses[d.id] ?? d.status
      return status === 'pending' || status === 'processing'
    },
  )

  return (
    <>
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
              {detail.documents.length > 0 && (
                <button
                  onClick={() => openDocReview(0)}
                  className="inline-flex items-center gap-1.5 text-brand-primary-600 hover:text-brand-primary-800 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Review All
                </button>
              )}
            </div>
            {detail.documents.length === 0 ? (
              <p className="text-sm text-brand-neutral-400">No documents submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {detail.documents.map((doc, idx) => {
                  const hasNote = doc.review_note && doc.review_note.length > 0
                  return (
                    <button
                      key={doc.id}
                      onClick={() => openDocReview(idx)}
                      className="w-full text-left flex items-center gap-3 rounded-lg border border-brand-neutral-200 px-3 py-2.5 hover:bg-brand-neutral-50 hover:border-brand-neutral-300 transition-colors group"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-brand-neutral-50 text-brand-neutral-400 shrink-0 group-hover:bg-brand-neutral-100 transition-colors">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-neutral-900 truncate group-hover:text-brand-primary-700 transition-colors">
                          {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                        </p>
                        <p className="text-xs text-brand-neutral-400 truncate">{doc.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasNote && (
                          <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <StatusChip status={localDocStatuses[doc.id] ?? doc.status} className="shrink-0" />
                        <ChevronRightIcon className="h-4 w-4 text-brand-neutral-300 group-hover:text-brand-neutral-500 transition-colors" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {someDocsNeedReview && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                Click a document to review and update its status
              </p>
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

      {/* Document Review Modal */}
      <DocumentReviewModal
        documents={detail.documents}
        initialIndex={reviewDocIndex}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onDocumentsUpdated={handleDocumentsUpdated}
      />
    </>
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
