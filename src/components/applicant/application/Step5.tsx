"use client";

import { CheckCircle2, FileText, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExistingApplicationData } from "@/actions/applicant/application";

const STATUS_LABELS: Record<string, string> = {
  processing: "Processing",
  paused: "Paused",
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
};

const STATUS_COLORS: Record<string, string> = {
  processing: "text-blue-600 bg-blue-50",
  paused: "text-amber-600 bg-amber-50",
  approved: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50",
  pending: "text-yellow-600 bg-yellow-50",
};

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const count = Array.isArray(children) ? children.filter(Boolean).length : 1;
  if (count === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">{children}</div>
    </div>
  );
}

export function Step5({
  data,
  onEdit,
}: {
  data: ExistingApplicationData;
  onEdit?: () => void;
}) {
  const { application, profile, documents, payment, applicant_profile, passport, visa_details, educations, employments, dependents, family_backgrounds } = data;
  const statusColor = STATUS_COLORS[application.status] ?? "text-neutral-600 bg-neutral-50";
  const canEdit = application.status === "pending" || application.status === "rejected";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          {canEdit ? "Application Details" : "Application Under Review"}
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {canEdit
            ? "You can review your application details below. If you need to make changes, click the Edit button."
            : "Your application has been submitted and is currently being reviewed. You will be notified of any updates."}
        </p>
        {canEdit && onEdit && (
          <Button
            onClick={onEdit}
            className="mt-4 bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-5 py-2 rounded-md font-semibold flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Application
          </Button>
        )}
      </div>

      <div className="mb-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Application Code
            </p>
            <p className="text-sm font-semibold text-neutral-800">
              {application.application_code}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {STATUS_LABELS[application.status] ?? application.status}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          Submitted on {new Date(application.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Personal Details">
          <Field label="Last Name" value={applicant_profile?.last_name ?? profile.name.split(" ")[0] ?? ""} />
          <Field label="First Name" value={applicant_profile?.first_name ?? profile.name.split(" ").slice(1).join(" ") ?? ""} />
          <Field label="Middle Name" value={applicant_profile?.middle_name ?? ""} />
          <Field label="Date of Birth" value={applicant_profile?.date_of_birth ?? profile.birthday} />
          <Field label="Place of Birth" value={applicant_profile?.place_of_birth ?? ""} />
          <Field label="Gender" value={applicant_profile?.gender === "male" ? "Male" : applicant_profile?.gender === "female" ? "Female" : profile.sex === "male" ? "Male" : profile.sex === "female" ? "Female" : applicant_profile?.gender ?? profile.sex} />
          <Field label="Religion" value={applicant_profile?.religion ?? ""} />
          <Field label="Citizenship" value={applicant_profile?.nationality ?? profile.nationality} />
          <Field label="Civil Status" value={applicant_profile?.civil_status ?? profile.marital_status} />
          <Field label="Height (cm)" value={applicant_profile ? String(applicant_profile.height) : ""} />
          <Field label="Weight (kg)" value={applicant_profile ? String(applicant_profile.weight) : ""} />
        </Section>

        {passport && (
          <Section title="Passport Details">
            <Field label="Passport Number" value={passport.passport_number} />
            <Field label="Place of Issue" value={passport.place_of_issue} />
            <Field label="Date of Issue" value={passport.date_of_issue} />
            <Field label="Valid Until" value={passport.expiration} />
          </Section>
        )}

        {application.future_plans && (
          <Section title="Future Plans in the Philippines">
            <Field label="Future Plan" value={application.future_plans} />
          </Section>
        )}

        {visa_details && (
          <Section title="Arrival & Visa Details">
            <Field label="Date of Arrival" value={visa_details.date_of_arrival ?? ""} />
            <Field label="Entry Visa Type" value={visa_details.entry_visa_type ?? ""} />
            <Field label="Tourist Visa Expiry" value={visa_details.exp_date_tourist_visa ?? ""} />
          </Section>
        )}

        {educations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Educational Attainment
            </h3>
            <div className="space-y-3">
              {educations.map((edu, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Field label="School" value={edu.school} />
                  <Field label="Location" value={edu.location} />
                  <Field label="Start Date" value={edu.start_date} />
                  <Field label="End Date" value={edu.end_date} />
                </div>
              ))}
            </div>
          </div>
        )}

        {employments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Employment History
            </h3>
            <div className="space-y-3">
              {employments.map((emp, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Field label="Company" value={emp.company_name ?? ""} />
                  <Field label="Job Title" value={emp.job_title ?? ""} />
                  <Field label="Contact No." value={emp.contact_no ?? ""} />
                  <Field label="Address" value={emp.company_address ?? ""} />
                  <Field label="Start Date" value={emp.start_date ?? ""} />
                  <Field label="End Date" value={emp.end_date ?? ""} />
                </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Contact Information">
          <Field label="Home Country Address" value={application.street} />
          <Field label="PH Primary Address" value={application.ph_address ?? ""} />
          <Field label="PH Secondary Address" value={application.ph_secondary_address ?? ""} />
          <Field label="Telephone Number" value={application.tel_no ?? ""} />
          <Field label="Fax Number" value={application.fax_no ?? ""} />
          <Field label="Mobile Number" value={application.phone_number} />
          <Field label="Email" value={profile.email} />
        </Section>

        {family_backgrounds && (
          <Section title="Parents' Information">
            <Field label="Father's Name" value={family_backgrounds.father_name} />
            <Field label="Father's Age" value={family_backgrounds.father_age != null ? String(family_backgrounds.father_age) : ""} />
            <Field label="Mother's Name" value={family_backgrounds.mother_name} />
            <Field label="Mother's Age" value={family_backgrounds.mother_age != null ? String(family_backgrounds.mother_age) : ""} />
          </Section>
        )}

        {dependents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Accompanying Dependents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {dependents.map((dep, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                    {dep.name}
                  </p>
                  <p className="text-sm text-neutral-800">
                    {dep.relationship} — Age: {dep.age}{dep.is_included ? "" : " (not included)"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Emergency Contact">
          <Field label="Contact Name" value={application.emergency_name ?? ""} />
          <Field label="Relationship" value={application.emergency_relationship ?? ""} />
          <Field label="Phone Number" value={application.emergency_phone ?? ""} />
        </Section>

        <div>
          <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Uploaded Documents
          </h3>
          {documents.length === 0 ? (
            <p className="text-sm text-neutral-400">No documents uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {documents.map((doc) => (
                <div key={doc.type}>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                  </p>
                  <p className="text-sm text-neutral-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    {doc.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {payment && (
          <Section title="Payment">
            <Field
              label="Amount"
              value={`₱${Number(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
            />
            <Field label="Status" value={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)} />
          </Section>
        )}
      </div>
    </>
  );
}
