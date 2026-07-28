"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, FileText } from "lucide-react";
import type { FamilyMember } from "./Step2";

type Step1Data = {
  last_name: string;
  first_name: string;
  middle_name: string;
  birthday: string;
  place_of_birth: string;
  sex: string;
  religion: string;
  nationality: string;
  marital_status: string;
  height: string;
  weight: string;
  passport_number: string;
  passport_place_of_issue: string;
  passport_date_of_issue: string;
  passport_valid_until: string;
};

type Step2Data = {
  home_country_address: string;
  ph_primary_address: string;
  ph_secondary_address: string;
  telephone_number: string;
  fax_number: string;
  mobile_number: string;
  email: string;
  father_name: string;
  father_age: string;
  mother_name: string;
  mother_age: string;
  family_members: FamilyMember[];
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
};

type DocumentFile = { file: File | null; name: string };
type Step4Data = Record<string, DocumentFile>;

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
  step4Data,
}: {
  step1Data: Step1Data;
  step2Data: Step2Data;
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
          <Field label="Last Name" value={step1Data.last_name} />
          <Field label="First Name" value={step1Data.first_name} />
          <Field label="Middle Name" value={step1Data.middle_name} />
          <Field label="Date of Birth" value={step1Data.birthday} />
          <Field label="Place of Birth" value={step1Data.place_of_birth} />
          <Field label="Gender" value={step1Data.sex === "male" ? "Male" : step1Data.sex === "female" ? "Female" : step1Data.sex} />
          <Field label="Religion" value={step1Data.religion} />
          <Field label="Citizenship" value={step1Data.nationality} />
          <Field label="Civil Status" value={step1Data.marital_status} />
          <Field label="Height (cm)" value={step1Data.height} />
          <Field label="Weight (kg)" value={step1Data.weight} />
        </Section>

        <Section title="Passport Details">
          <Field label="Passport Number" value={step1Data.passport_number} />
          <Field label="Place of Issue" value={step1Data.passport_place_of_issue} />
          <Field label="Date of Issue" value={step1Data.passport_date_of_issue} />
          <Field label="Valid Until" value={step1Data.passport_valid_until} />
        </Section>

        <Section title="Contact Information">
          <Field label="Home Country Address" value={step2Data.home_country_address} />
          <Field label="PH Primary Address" value={step2Data.ph_primary_address} />
          <Field label="PH Secondary Address" value={step2Data.ph_secondary_address} />
          <Field label="Telephone Number" value={step2Data.telephone_number} />
          <Field label="Fax Number" value={step2Data.fax_number} />
          <Field label="Mobile Number" value={step2Data.mobile_number} />
          <Field label="Email" value={step2Data.email} />
        </Section>

        <Section title="Parents' Information">
          <Field label="Father's Name" value={step2Data.father_name} />
          <Field label="Father's Age" value={step2Data.father_age} />
          <Field label="Mother's Name" value={step2Data.mother_name} />
          <Field label="Mother's Age" value={step2Data.mother_age} />
        </Section>

        {step2Data.family_members.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B1A2B] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Accompanying Dependents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {step2Data.family_members.map((member, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                    {member.full_name}
                  </p>
                  <p className="text-sm text-neutral-800">
                    {member.relationship} — Age: {member.age}{member.include ? "" : " (not included)"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Emergency Contact">
          <Field label="Contact Name" value={step2Data.emergency_name} />
          <Field label="Relationship" value={step2Data.emergency_relationship} />
          <Field label="Phone Number" value={step2Data.emergency_phone} />
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
