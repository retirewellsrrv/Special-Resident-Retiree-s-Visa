import { FileText, ShieldCheck, Banknote, Stethoscope } from "lucide-react";
import type { DocumentType } from "@/schemas/document";

type Step4Data = Record<DocumentType, { file: File | null; name: string }>;

export const documentSections = [
  {
    number: 1,
    title: "Identification & Entry",
    icon: <FileText className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "passport" as keyof Step4Data,
        title: "ORIGINAL PASSPORT",
        description:
          "With valid tourist visa entry stamp.",
        required: true,
      },
      {
        key: "photo_2x2" as keyof Step4Data,
        title: "2x2 PHOTO",
        description:
          "Recent colored photo with white background.",
        required: true,
      },
    ],
  },
  {
    number: 2,
    title: "Official Forms & Clearances",
    icon: <ShieldCheck className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "pra_application" as keyof Step4Data,
        title: "PRA APPLICATION FORM",
        description:
          "Duly accomplished application form for SRRV.",
        required: false,
      },
      {
        key: "medical" as keyof Step4Data,
        title: "MEDICAL EXAMINATION REPORT",
        description:
          "Medical examination report from a licensed physician.",
        required: true,
      },
      {
        key: "police" as keyof Step4Data,
        title: "POLICE CLEARANCE",
        description:
          "From country of origin/last residence. (NBI required if stayed >90 days in PH)",
        required: true,
      },
      {
        key: "bicc" as keyof Step4Data,
        title: "BUREAU OF IMMIGRATION CLEARANCE (BICC)",
        description:
          "Official clearance certificate from the Bureau of Immigration.",
        required: true,
      },
    ],
  },
  {
    number: 3,
    title: "Financial Proof",
    icon: <Banknote className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "bank_cert" as keyof Step4Data,
        title: "BANK CERTIFICATE / INWARD REMITTANCE",
        description:
          "Proof of the required Visa deposit in an accredited bank.",
        required: true,
      },
      {
        key: "proof_payment" as keyof Step4Data,
        title: "PROCESSING AND ANNUAL FEES",
        description:
          "Receipt or proof of payment for application fees.",
        required: true,
      },
      {
        key: "proof_pension" as keyof Step4Data,
        title: "PROOF OF PENSION",
        description:
          "Official document proving monthly pension (if applicable of SRRV options).",
        required: false,
      },
    ],
  },
  {
    number: 4,
    title: "Dependents (if applicable)",
    icon: <Stethoscope className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "proof_relationship" as keyof Step4Data,
        title: "PROOF OF RELATIONSHIP",
        description:
          "Marriage Certificate, Birth Certificate, or Household Registry to Principal Retiree.",
        required: false,
      },
    ],
  },
];