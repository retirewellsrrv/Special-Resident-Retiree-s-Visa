'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, CalendarDays, Wallet, FileText, Clock, Mail, Check, Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { StatusChip } from '@/components/ui/status-chip'
import { updateConsultationStatus } from '@/actions/admin/consultations'
import type { ConsultationDetail } from '@/actions/admin/consultations'

const MODE_LABELS: Record<string, string> = {
  zoom_meeting: 'Zoom Meeting',
  google_meet: 'Google Meet',
  whatsApp: 'WhatsApp',
  face_2_face: 'Face-to-Face',
  phone_call: 'Phone Call',
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

interface Props {
  detail: ConsultationDetail
  onStatusChange: () => void
}

export function ConsultationDetail({ detail, onStatusChange }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(detail.status)

  useEffect(() => {
    setSelectedStatus(detail.status)
  }, [detail.id, detail.status])

  const handleStatus = (status: string) => {
    startTransition(async () => {
      const result = await updateConsultationStatus(detail.id, status)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (status === 'accepted') {
        toast.success('Consultation accepted — the applicant can now submit their application')
      } else if (status === 'rejected') {
        toast.success('Consultation rejected')
      } else {
        toast.success(`Consultation marked as ${status.replace('_', ' ')}`)
      }
      onStatusChange()
    })
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-5 py-4 border-b border-brand-neutral-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-brand-neutral-900 truncate">{detail.applicant_name}</h3>
            <p className="text-xs text-brand-neutral-400 mt-0.5">
              Requested {formatDateTime(detail.created_at)}
            </p>
            {detail.status === 'accepted' && detail.approved_at && (
              <p className="text-xs text-green-700 mt-1">
                Accepted{detail.approved_by_name ? ` by ${detail.approved_by_name}` : ''} ·{' '}
                {formatDateTime(detail.approved_at)}
              </p>
            )}
          </div>
        <StatusChip status={detail.status} className="shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
        {/* ── Consultation Request ── */}
        <section className="px-5 py-4 space-y-3">
          <SectionTitle icon={CalendarDays} label="Consultation Request" />
          <div className="space-y-1.5">
            <span className="text-brand-neutral-400 text-xs font-semibold uppercase tracking-wider">Client Email</span>
            <div className="flex items-center gap-2">
              {detail.email ? (
                <>
                  <a
                    href={`mailto:${detail.email}`}
                    className="text-sm text-brand-primary-700 hover:text-brand-primary-900 hover:underline truncate"
                  >
                    {detail.email}
                  </a>
                  <CopyButton value={detail.email} />
                </>
              ) : (
                <p className="text-sm text-brand-neutral-400">No email on file</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <InfoRow label="Preferred Date" value={formatDate(detail.meeting_date)} />
            <InfoRow label="Mode" value={MODE_LABELS[detail.mode_communication] ?? detail.mode_communication.replace(/_/g, ' ')} />
          </div>
          <div className="space-y-1.5">
            <span className="text-brand-neutral-400 text-xs font-semibold uppercase tracking-wider">Purpose</span>
            <p className="text-sm text-brand-neutral-900 leading-relaxed whitespace-pre-wrap">{detail.purpose}</p>
          </div>
        </section>

        {/* ── Payment ── */}
        {detail.payment ? (
          <section className="px-5 py-4 space-y-3">
            <SectionTitle icon={Wallet} label="Consultation Payment" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow label="Transaction Code" value={detail.payment.transaction_code} />
              <InfoRow label="Amount" value={`$${Number(detail.payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Method" value={detail.payment.payment_method} className="capitalize" />
              <InfoRow
                label="Status"
                value={detail.payment.status.charAt(0).toUpperCase() + detail.payment.status.slice(1)}
              />
            </div>
          </section>
        ) : (
          <section className="px-5 py-4 space-y-3">
            <SectionTitle icon={Wallet} label="Consultation Payment" />
            <p className="text-sm text-brand-neutral-400">No consultation payment recorded yet.</p>
          </section>
        )}

        {/* ── Linked Application ── */}
        {detail.application ? (
          <section className="px-5 py-4 space-y-3">
            <SectionTitle icon={FileText} label="Linked Application" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow label="Code" value={detail.application.application_code} />
              <div className="flex items-center gap-2">
                <span className="text-brand-neutral-400">Status:</span>
                <StatusChip status={detail.application.status} />
              </div>
              <InfoRow label="Submitted At" value={formatDateTime(detail.application.created_at)} className="col-span-2" />
            </div>
          </section>
        ) : (
          <section className="px-5 py-4 space-y-3">
            <SectionTitle icon={FileText} label="Linked Application" />
            <p className="text-sm text-brand-neutral-400">No application has been started from this consultation yet.</p>
          </section>
        )}

        {/* ── Consultation Status Actions ── */}
        <section className="px-5 py-4 space-y-3">
          <SectionTitle icon={Clock} label="Consultation Status" />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isPending}
              aria-label="Consultation status"
              className="text-sm rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => handleStatus(selectedStatus)}
              disabled={isPending || selectedStatus === detail.status}
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

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </h4>
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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy email')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy client email"
      title="Copy client email"
      className="inline-flex items-center justify-center rounded-md border border-brand-neutral-200 p-1.5 text-brand-neutral-400 hover:text-brand-neutral-700 hover:border-brand-neutral-300 transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}