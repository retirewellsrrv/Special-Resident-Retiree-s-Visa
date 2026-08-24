'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  UserRound,
  FileText,
  CalendarClock,
  Wallet,
  ExternalLink,
  ClipboardCheck,
  GraduationCap,
  Briefcase,
  Users,
  Heart,
  User,
  MapPin,
  Plane,
  type LucideIcon,
} from 'lucide-react'
import { StatusChip } from '@/components/ui/status-chip'
import type { ClientDetail, ApprovedApplicationDetail } from '@/actions/admin/client-profiles'

const MODE_LABELS: Record<string, string> = {
  zoom_meeting: 'Zoom Meeting',
  google_meet: 'Google Meet',
  whatsApp: 'WhatsApp',
  face_2_face: 'Face-to-Face',
  phone_call: 'Phone Call',
}

const METHOD_LABELS: Record<string, string> = {
  pool: 'Pool',
  callback_virtual_account: 'Virtual Account',
  credit_card: 'Credit Card',
  retail_outlet: 'Retail Outlet',
  qr_code: 'QR Code',
  qris: 'QRIS',
  ewallet: 'E-Wallet',
  direct_debit: 'Direct Debit',
  bank_transfer: 'Bank Transfer',
  paylater: 'Pay Later',
  cryptocurrency: 'Cryptocurrency',
}

function formatDate(dateStr: string) {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatMoney(amount: number) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function ClientProfileDetail({ detail }: { detail: ClientDetail }) {
  const { profile } = detail

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* ── Left: Profile ── */}
      <section className="lg:col-span-1 rounded-xl border border-brand-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary-700">
            <UserRound className="size-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-brand-neutral-900 truncate">{profile.name}</h2>
            <p className="text-xs text-brand-neutral-400 capitalize">{profile.nationality}</p>
          </div>
        </div>

        <div className="border-t border-brand-neutral-100 divide-y divide-brand-neutral-50">
          <InfoRow label="Sex" value={profile.sex} />
          <InfoRow label="Birthday" value={formatDate(profile.birthday)} />
          <InfoRow label="Age" value={profile.age != null ? String(profile.age) : '\u2014'} />
          <InfoRow label="Marital Status" value={profile.marital_status} />
          <InfoRow label="Nationality" value={profile.nationality} />
        </div>
      </section>

      {/* ── Right: Applications / Consultations / Payments ── */}
      <div className="lg:col-span-2 space-y-6">
        <Section icon={FileText} title="Applications">
          {detail.applications.length === 0 ? (
            <Empty text="No application submitted yet." />
          ) : (
            <div className="divide-y divide-brand-neutral-50">
              {detail.applications.map((app) => (
                <div key={app.id} className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900 font-mono">{app.application_code}</p>
                    <p className="text-xs text-brand-neutral-400">Submitted {formatDateTime(app.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={app.status} />
                    <Link
                      href={`/admin/applications?userId=${profile.user_id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-700 hover:text-brand-primary-900"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {detail.applications.some((app) => app.fullDetail) && (
          <Section icon={ClipboardCheck} title="Approved Application Details">
            <div className="divide-y divide-brand-neutral-50">
              {detail.applications
                .filter((app) => app.fullDetail)
                .map((app) => (
                  <div key={app.id} className="py-3 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-neutral-900 font-mono">{app.application_code}</p>
                        <p className="text-xs text-brand-neutral-400">Approved {formatDateTime(app.updated_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip status={app.status} />
                        <Link
                          href={`/admin/applications?userId=${profile.user_id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-700 hover:text-brand-primary-900"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    <ApprovedDetail d={app.fullDetail!} />
                  </div>
                ))}
            </div>
          </Section>
        )}

        <Section icon={CalendarClock} title="Consultations">
          {detail.consultations.length === 0 ? (
            <Empty text="No consultation request yet." />
          ) : (
            <div className="divide-y divide-brand-neutral-50">
              {detail.consultations.map((c) => (
                <div key={c.id} className="py-3 space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="text-sm font-medium text-brand-neutral-900 capitalize">
                      {MODE_LABELS[c.mode_communication] ?? c.mode_communication.replace(/_/g, ' ')}
                      {' \u00b7 '}
                      {formatDate(c.meeting_date)}
                    </p>
                    <StatusChip status={c.status} />
                  </div>
                  <p className="text-xs text-brand-neutral-500 line-clamp-2">{c.purpose}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section icon={Wallet} title="Payments">
          {detail.payments.length === 0 ? (
            <Empty text="No payments recorded yet." />
          ) : (
            <div className="divide-y divide-brand-neutral-50">
              {detail.payments.map((p) => (
                <div key={p.id} className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900">{formatMoney(p.amount)}</p>
                    <p className="text-xs text-brand-neutral-400 font-mono">
                      {p.transaction_code}
                      {' \u00b7 '}
                      {METHOD_LABELS[p.payment_method] ?? p.payment_method.replace(/_/g, ' ')}
                      {' \u00b7 '}
                      <span className="capitalize">{p.service_type}</span>
                    </p>
                  </div>
                  <StatusChip status={p.status} />
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-brand-neutral-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-brand-neutral-100 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-neutral-400" />
        <h3 className="text-sm font-semibold text-brand-neutral-900">{title}</h3>
      </div>
      <div className="px-5 py-2">{children}</div>
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-brand-neutral-400 py-4">{text}</p>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-brand-neutral-900 capitalize text-right">{value}</span>
    </div>
  )
}

// ── Approved application breakdown ────────────────────────────────────────────

function ApprovedDetail({ d }: { d: ApprovedApplicationDetail }) {
  const hasEmergency =
    d.emergency_name || d.emergency_phone || d.emergency_relationship

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-4 md:col-span-2">
        {/* Contact Information */}
        <SubSection icon={User} title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            <DetailRow label="Phone" value={d.phone_number} />
            {d.email && <DetailRow label="Email" value={d.email} />}
            <DetailRow label="Street" value={d.street} />
            {d.ph_address && <DetailRow label="PH Address" value={d.ph_address} />}
          </div>
        </SubSection>
      </div>

      {/* Personal Profile */}
      {d.applicant_profile && (
        <SubSection icon={User} title="Personal Profile">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            <DetailRow
              label="Full Name"
              value={`${d.applicant_profile.first_name} ${
                d.applicant_profile.middle_name ? `${d.applicant_profile.middle_name} ` : ''
              }${d.applicant_profile.last_name}`}
              wide
            />
            <DetailRow label="Date of Birth" value={formatDate(d.applicant_profile.date_of_birth)} />
            <DetailRow label="Gender" value={d.applicant_profile.gender} />
            <DetailRow label="Civil Status" value={d.applicant_profile.civil_status} />
            <DetailRow label="Nationality" value={d.applicant_profile.nationality} />
            <DetailRow label="Place of Birth" value={d.applicant_profile.place_of_birth} />
            <DetailRow label="Religion" value={d.applicant_profile.religion} />
            <DetailRow label="Height" value={`${d.applicant_profile.height} cm`} />
            <DetailRow label="Weight" value={`${d.applicant_profile.weight} kg`} />
          </div>
        </SubSection>
      )}

      {/* Passport */}
      {d.passport && (
        <SubSection icon={MapPin} title="Passport Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            <DetailRow label="Passport No." value={d.passport.passport_number} />
            <DetailRow label="Place of Issue" value={d.passport.place_of_issue} />
            <DetailRow label="Date of Issue" value={formatDate(d.passport.date_of_issue)} />
            <DetailRow label="Expiration" value={formatDate(d.passport.expiration)} />
          </div>
        </SubSection>
      )}

      {/* Visa */}
      {d.visa_details && (
        <SubSection icon={Plane} title="Visa Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            <DetailRow label="Entry Visa Type" value={d.visa_details.entry_visa_type ?? '\u2014'} />
            <DetailRow
              label="Date of Arrival"
              value={d.visa_details.date_of_arrival ? formatDate(d.visa_details.date_of_arrival) : '\u2014'}
            />
            <DetailRow
              label="Tourist Visa Expiry"
              value={d.visa_details.exp_date_tourist_visa ? formatDate(d.visa_details.exp_date_tourist_visa) : '\u2014'}
            />
          </div>
        </SubSection>
      )}

      {/* Future Plans */}
      {d.future_plans && (
        <SubSection icon={FileText} title="Future Plans">
          <p className="text-sm text-brand-neutral-900 capitalize">{d.future_plans.replace(/_/g, ' ')}</p>
        </SubSection>
      )}

      {/* Emergency Contact */}
      {hasEmergency && (
        <SubSection icon={User} title="Emergency Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {d.emergency_name && <DetailRow label="Name" value={d.emergency_name} />}
            {d.emergency_phone && <DetailRow label="Phone" value={d.emergency_phone} />}
            {d.emergency_relationship && <DetailRow label="Relationship" value={d.emergency_relationship} />}
          </div>
        </SubSection>
      )}

      {/* Education */}
      {d.educations.length > 0 && (
        <SubSection icon={GraduationCap} title="Education">
          <div className="space-y-2">
            {d.educations.map((edu, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm"
              >
                <p className="font-medium text-brand-neutral-900">{edu.school}</p>
                <p className="text-brand-neutral-500 text-xs">{edu.location}</p>
                {edu.educ_attainment && (
                  <span className="inline-block mt-1 rounded-full bg-brand-neutral-100 px-2 py-0.5 text-xs font-medium text-brand-neutral-700">
                    {edu.educ_attainment}
                  </span>
                )}
                <p className="text-brand-neutral-400 text-xs mt-0.5">
                  {formatDate(edu.from_date)} {'\u2014'} {formatDate(edu.to_date)}
                </p>
              </div>
            ))}
          </div>
        </SubSection>
      )}

      {/* Employment */}
      {d.employments.length > 0 && (
        <SubSection icon={Briefcase} title="Employment History">
          <div className="space-y-2">
            {d.employments.map((emp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm"
              >
                <p className="font-medium text-brand-neutral-900">{emp.company_name ?? 'Unknown Company'}</p>
                <p className="text-brand-neutral-500 text-xs">{emp.job_title ?? '\u2014'}</p>
                {emp.company_address && <p className="text-brand-neutral-400 text-xs">{emp.company_address}</p>}
                <p className="text-brand-neutral-400 text-xs mt-0.5">
                  {emp.from_date ? formatDate(emp.from_date) : '\u2014'} {'\u2014'}{' '}
                  {emp.to_date ? formatDate(emp.to_date) : emp.is_current ? 'Present' : '\u2014'}
                </p>
              </div>
            ))}
          </div>
        </SubSection>
      )}

      {/* Dependents */}
      {d.dependents.length > 0 && (
        <SubSection icon={Users} title="Dependents">
          <div className="space-y-2">
            {d.dependents.map((dep, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm"
              >
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
        </SubSection>
      )}

      {/* Family Background */}
      {d.family_backgrounds && (
        <SubSection icon={Heart} title="Family Background">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
              <p className="text-[11px] text-brand-neutral-400 uppercase tracking-wider mb-0.5">Father</p>
              <p className="font-medium text-brand-neutral-900">{d.family_backgrounds.father_name}</p>
              {d.family_backgrounds.father_age != null && (
                <p className="text-xs text-brand-neutral-500">Age: {d.family_backgrounds.father_age}</p>
              )}
            </div>
            <div className="rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2.5 text-sm">
              <p className="text-[11px] text-brand-neutral-400 uppercase tracking-wider mb-0.5">Mother</p>
              <p className="font-medium text-brand-neutral-900">{d.family_backgrounds.mother_name}</p>
              {d.family_backgrounds.mother_age != null && (
                <p className="text-xs text-brand-neutral-500">Age: {d.family_backgrounds.mother_age}</p>
              )}
            </div>
          </div>
        </SubSection>
      )}

      {/* Documents */}
      {d.documents.length > 0 && (
        <SubSection icon={FileText} title={`Documents (${d.documents.length})`}>
          <div className="space-y-1.5">
            {d.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-3 py-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-neutral-900 truncate">{doc.name}</p>
                  {doc.review_note && <p className="text-xs text-amber-600 truncate">{doc.review_note}</p>}
                </div>
                <StatusChip status={doc.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </SubSection>
      )}
    </div>
  )
}

function SubSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <h5 className="text-xs font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h5>
      {children}
    </div>
  )
}

function DetailRow({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <p className="text-[11px] font-medium text-brand-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-brand-neutral-900 capitalize truncate">{value}</p>
    </div>
  )
}
