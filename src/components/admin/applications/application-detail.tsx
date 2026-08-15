'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, FileIcon, ExternalLink, MessageSquare,
  User, MapPin, Plane,
  GraduationCap, Briefcase, Users, Heart, ChevronDown, ChevronRight,
} from 'lucide-react'
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
  onDocReviewSaved?: () => void
}

export function ApplicationDetail({ detail, onStatusChange, onDocReviewSaved }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedAppStatus, setSelectedAppStatus] = useState(detail.status)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)

  // Document review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewDocIndex, setReviewDocIndex] = useState(0)

  // Local shadow of doc statuses — updated instantly when a review is saved
  // so the document list reflects the change without waiting for a refresh.
  const [localDocStatuses, setLocalDocStatuses] = useState<Record<number, string>>({})

  useEffect(() => {
    setSelectedAppStatus(detail.status)
    setLocalDocStatuses({})
    setShowAdditionalInfo(false)
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
    // Silently refresh detail data without deselecting the application
    onDocReviewSaved?.()
    router.refresh()
  }, [onDocReviewSaved, router])

  const someDocsNeedReview = detail.documents.some(
    (d) => {
      const status = localDocStatuses[d.id] ?? d.status
      return status === 'pending' || status === 'processing'
    },
  )

  const hasAdditionalData =
    detail.educations.length > 0 ||
    detail.employments.length > 0 ||
    detail.dependents.length > 0 ||
    detail.family_backgrounds !== null

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  return (
    <>
      <div className="flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
        <div className="px-5 py-4 border-b border-brand-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-neutral-900">{detail.applicant_name}</h3>
            <p className="text-xs text-brand-neutral-400 mt-0.5">
              {detail.application_code}
            </p>
            {detail.status === 'approved' && detail.approved_at && (
              <p className="text-xs text-green-700 mt-1">
                Approved{detail.approved_by_name ? ` by ${detail.approved_by_name}` : ''} ·{' '}
                {new Date(detail.approved_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <StatusChip status={detail.status} />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-brand-neutral-50">
          {/* ── Contact Information ── */}
          <section className="px-5 py-4 space-y-3">
            <SectionTitle icon={User} label="Contact Information" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow label="Phone" value={detail.phone_number} />
              {detail.email && <InfoRow label="Email" value={detail.email} />}
              <InfoRow label="Street" value={detail.street} />
              {detail.ph_address && <InfoRow label="PH Address" value={detail.ph_address} className="col-span-2" />}
            </div>
          </section>

          {/* ── Personal Profile ── */}
          {detail.applicant_profile && (
            <section className="px-5 py-4 space-y-3">
              <SectionTitle icon={User} label="Personal Profile" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow
                  label="Full Name"
                  value={`${detail.applicant_profile.first_name} ${detail.applicant_profile.middle_name ? detail.applicant_profile.middle_name + ' ' : ''}${detail.applicant_profile.last_name}`}
                  className="col-span-2"
                />
                <InfoRow label="Date of Birth" value={formatDate(detail.applicant_profile.date_of_birth)} />
                <InfoRow label="Gender" value={detail.applicant_profile.gender} />
                <InfoRow label="Civil Status" value={detail.applicant_profile.civil_status} />
                <InfoRow label="Nationality" value={detail.applicant_profile.nationality} />
                <InfoRow label="Place of Birth" value={detail.applicant_profile.place_of_birth} />
                <InfoRow label="Religion" value={detail.applicant_profile.religion} />
                <InfoRow label="Height" value={`${detail.applicant_profile.height} cm`} />
                <InfoRow label="Weight" value={`${detail.applicant_profile.weight} kg`} />
              </div>
            </section>
          )}

          {/* ── Passport Details ── */}
          {detail.passport && (
            <section className="px-5 py-4 space-y-3">
              <SectionTitle icon={MapPin} label="Passport Details" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow label="Passport No." value={detail.passport.passport_number} />
                <InfoRow label="Place of Issue" value={detail.passport.place_of_issue} />
                <InfoRow label="Date of Issue" value={formatDate(detail.passport.date_of_issue)} />
                <InfoRow
                  label="Expiration Date"
                  value={formatDate(detail.passport.expiration)}
                  className={isExpired(detail.passport.expiration) ? 'text-red-600 font-semibold' : ''}
                />
              </div>
            </section>
          )}

          {/* ── Visa Details ── */}
          {detail.visa_details && (
            <section className="px-5 py-4 space-y-3">
              <SectionTitle icon={Plane} label="Visa Details" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow label="Entry Visa Type" value={detail.visa_details.entry_visa_type ?? '-'} />
                <InfoRow label="Date of Arrival" value={detail.visa_details.date_of_arrival ? formatDate(detail.visa_details.date_of_arrival) : '-'} />
                <InfoRow label="Tourist Visa Expiry" value={detail.visa_details.exp_date_tourist_visa ? formatDate(detail.visa_details.exp_date_tourist_visa) : '-'} />
              </div>
            </section>
          )}

          {/* ── Future Plans ── */}
          {detail.future_plans && (
            <section className="px-5 py-4 space-y-3">
              <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Future Plans</h4>
              <p className="text-sm text-brand-neutral-900 capitalize">{detail.future_plans.replace(/_/g, ' ')}</p>
            </section>
          )}

          {/* ── Emergency Contact ── */}
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

          {/* ── Payment ── */}
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

          {/* ── Consultation ── */}
          {detail.consultation && (
            <section className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider">Consultation</h4>
                <a
                  href="/admin/consultations"
                  className="inline-flex items-center gap-1.5 text-brand-primary-600 hover:text-brand-primary-800 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Consultations
                </a>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow label="Status" value={detail.consultation.status} className="capitalize" />
                <InfoRow label="Purpose" value={detail.consultation.purpose} />
                <InfoRow label="Meeting Date" value={detail.consultation.meeting_date} />
                <InfoRow label="Mode" value={detail.consultation.mode_communication} className="capitalize" />
                <InfoRow
                  label="Requested At"
                  value={new Date(detail.consultation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                />
              </div>
            </section>
          )}

          {/* ── Documents ── */}
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
                        <ChevronRight className="h-4 w-4 text-brand-neutral-300 group-hover:text-brand-neutral-500 transition-colors" />
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

          {/* ── Additional Information (Collapsible) ── */}
          {hasAdditionalData && (
            <section className="px-5 py-4 space-y-3">
              <button
                onClick={() => setShowAdditionalInfo((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-semibold text-brand-neutral-500 uppercase tracking-wider hover:text-brand-neutral-700 transition-colors group"
              >
                <span>Additional Information</span>
                {showAdditionalInfo ? (
                  <ChevronDown className="h-4 w-4 text-brand-neutral-400 group-hover:text-brand-neutral-600 transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-brand-neutral-400 group-hover:text-brand-neutral-600 transition-colors" />
                )}
              </button>

              {showAdditionalInfo && (
                <div className="space-y-5 pt-1">
                  {/* Education */}
                  {detail.educations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Education
                      </h5>
                      <div className="space-y-2">
                        {detail.educations.map((edu, idx) => (
                          <div key={idx} className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
                            <p className="font-medium text-brand-neutral-900">{edu.school}</p>
                            <p className="text-brand-neutral-500 text-xs">{edu.location}</p>
                            {edu.educ_attainment && (
                              <span className="inline-block mt-1 rounded-full bg-brand-neutral-100 px-2 py-0.5 text-xs font-medium text-brand-neutral-700">
                                {edu.educ_attainment}
                              </span>
                            )}
                            <p className="text-brand-neutral-400 text-xs mt-0.5">
                              {formatDate(edu.from_date)} — {formatDate(edu.to_date)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Employment */}
                  {detail.employments.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Employment History
                      </h5>
                      <div className="space-y-2">
                        {detail.employments.map((emp, idx) => (
                          <div key={idx} className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
                            <p className="font-medium text-brand-neutral-900">{emp.company_name ?? 'Unknown Company'}</p>
                            <p className="text-brand-neutral-500 text-xs">{emp.job_title ?? '-'}</p>
                            {emp.company_address && (
                              <p className="text-brand-neutral-400 text-xs">{emp.company_address}</p>
                            )}
                            <p className="text-brand-neutral-400 text-xs mt-0.5">
                              {emp.from_date ? formatDate(emp.from_date) : '-'} — {emp.to_date ? formatDate(emp.to_date) : emp.is_current ? 'Present' : '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependents */}
                  {detail.dependents.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <Users className="h-3.5 w-3.5" />
                        Dependents
                      </h5>
                      <div className="space-y-2">
                        {detail.dependents.map((dep, idx) => (
                          <div key={idx} className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
                            <p className="font-medium text-brand-neutral-900">{dep.name}</p>
                            <div className="text-brand-neutral-500 text-xs mt-0.5 space-x-3">
                              <span>Age: {dep.age}</span>
                              <span>Relationship: {dep.relationship}</span>
                            </div>
                            <div className="text-brand-neutral-400 text-xs">
                              <span>Passport: {dep.passport_no}</span>
                              {dep.is_included && (
                                <span className="ml-2 inline-flex items-center gap-1 text-brand-primary-600 font-medium">
                                  <span className="size-1.5 rounded-full bg-brand-primary-500" />
                                  Included
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Family Background */}
                  {detail.family_backgrounds && (
                    <div>
                      <h5 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <Heart className="h-3.5 w-3.5" />
                        Family Background
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
                          <p className="text-[11px] text-brand-neutral-400 uppercase tracking-wider mb-0.5">Father</p>
                          <p className="font-medium text-brand-neutral-900">{detail.family_backgrounds.father_name}</p>
                          {detail.family_backgrounds.father_age != null && (
                            <p className="text-xs text-brand-neutral-500">Age: {detail.family_backgrounds.father_age}</p>
                          )}
                        </div>
                        <div className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
                          <p className="text-[11px] text-brand-neutral-400 uppercase tracking-wider mb-0.5">Mother</p>
                          <p className="font-medium text-brand-neutral-900">{detail.family_backgrounds.mother_name}</p>
                          {detail.family_backgrounds.mother_age != null && (
                            <p className="text-xs text-brand-neutral-500">Age: {detail.family_backgrounds.mother_age}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Application Status ── */}
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

/* ── Helper: section title with icon ── */
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

/* ── Helper: label + value row ── */
function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="text-brand-neutral-400">{label}:</span>{' '}
      <span className="text-brand-neutral-900">{value}</span>
    </div>
  )
}

/* ── Helper: check if passport is expired ── */
function isExpired(expirationDate: string): boolean {
  if (!expirationDate) return false
  const exp = new Date(expirationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return exp < today
}
