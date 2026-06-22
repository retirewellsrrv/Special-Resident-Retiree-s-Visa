"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, FileText } from "lucide-react";

type Step1Data = {
  name: string;
  birthday: string;
  sex: string;
  nationality: string;
  marital_status: string;
};

type Step2Data = {
  email: string;
  phone_number: string;
  phone_dial_code: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ph_address: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
};

type DocumentFile = { file: File | null; name: string };
type Step4Data = Record<string, DocumentFile>;

type ServiceType = "basic" | "premium" | "vip";

const SERVICE_LABELS: Record<ServiceType, string> = {
  basic: "Basic",
  premium: "Premium",
  vip: "VIP",
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
  step1Data,
  step2Data,
  selectedService,
  step4Data,
}: {
  step1Data: Step1Data;
  step2Data: Step2Data;
  selectedService: ServiceType | "";
  step4Data: Step4Data;
}) {
  const uploadedDocs = Object.entries(step4Data).filter(([, doc]) => doc.file);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Review Your Application
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Please review all the information below before submitting your application.
        </p>
      </div>

      <div className="space-y-6">
        <Section title="Personal Details">
          <Field label="Full Name" value={step1Data.name} />
          <Field label="Birthday" value={step1Data.birthday} />
          <Field label="Sex" value={step1Data.sex === "male" ? "Male" : step1Data.sex === "female" ? "Female" : step1Data.sex} />
          <Field label="Nationality" value={step1Data.nationality} />
          <Field label="Marital Status" value={step1Data.marital_status} />
        </Section>

        <Section title="Contact Information">
          <Field label="Email" value={step2Data.email} />
          <Field label="Phone Number" value={step2Data.phone_dial_code + step2Data.phone_number} />
          <Field label="Street" value={step2Data.street} />
          <Field label="City" value={step2Data.city} />
          <Field label="State / Province" value={step2Data.state} />
          <Field label="ZIP / Postal Code" value={step2Data.zip} />
          <Field label="Country" value={step2Data.country} />
          <Field label="Philippine Address" value={step2Data.ph_address} />
        </Section>

        <Section title="Emergency Contact">
          <Field label="Contact Name" value={step2Data.emergency_name} />
          <Field label="Relationship" value={step2Data.emergency_relationship} />
          <Field label="Phone Number" value={step2Data.emergency_phone} />
        </Section>

        <Section title="Service Selection">
          <Field
            label="Selected Plan"
            value={selectedService ? SERVICE_LABELS[selectedService as ServiceType] || selectedService : ""}
          />
        </Section>

        <div>
          <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Uploaded Documents
          </h3>
          {uploadedDocs.length === 0 ? (
            <p className="text-sm text-neutral-400">No documents uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {uploadedDocs.map(([key, doc]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
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
      </div>
    </>
  );
}
