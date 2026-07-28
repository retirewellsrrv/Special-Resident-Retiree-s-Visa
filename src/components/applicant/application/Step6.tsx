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

export function Step6({
  data,
  onEdit,
}: {
  data: ExistingApplicationData;
  onEdit?: () => void;
}) {
  const { application, profile, documents, payment } = data;
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
          <Field label="Full Name" value={profile.name} />
          <Field label="Birthday" value={profile.birthday} />
          <Field label="Sex" value={profile.sex === "male" ? "Male" : profile.sex === "female" ? "Female" : profile.sex} />
          <Field label="Nationality" value={profile.nationality} />
          <Field label="Marital Status" value={profile.marital_status} />
        </Section>

        <Section title="Contact Information">
          <Field label="Email" value={profile.email} />
          <Field label="Phone Number" value={application.phone_number} />
          <Field label="Street" value={application.street} />
          <Field label="City" value={application.city} />
          <Field label="State / Province" value={application.state} />
          <Field label="ZIP / Postal Code" value={application.zip} />
          <Field label="Country" value={application.country} />
          <Field label="Philippine Address" value={application.ph_address ?? ""} />
        </Section>

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
