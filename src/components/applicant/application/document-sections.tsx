import { FileText, ShieldCheck, Banknote, Stethoscope } from "lucide-react";
import { Step4Data } from "./types";

export const documentSections = [
  {
    number: 1,
    title: "Identification Documents",
    icon: <FileText className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "passportBio" as keyof Step4Data,
        title: "PASSPORT BIO PAGE",
        description:
          "Colored scan of the main identification page showing photo and details.",
        required: true,
      },
      {
        key: "validService" as keyof Step4Data,
        title: "VALID SERVICE PAGE",
        description:
          "Page containing your current Bureau of Immigration entry stamp.",
        required: true,
      },
    ],
  },
  {
    number: 2,
    title: "Background Clearances",
    icon: <ShieldCheck className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "nbiClearance" as keyof Step4Data,
        title: "NBI OR POLICE CLEARANCE",
        description:
          "Clearance from home country or NBI if staying in PH for +1 month.",
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
        key: "pensionCert" as keyof Step4Data,
        title: "PENSION OR BANK CERTIFICATION",
        description:
          "Official document proving monthly pension of $800+ or $10,000 deposit.",
        required: true,
      },
    ],
  },
  {
    number: 4,
    title: "Medical Records",
    icon: <Stethoscope className="w-4 h-4 text-[#8B1A2B]" />,
    documents: [
      {
        key: "medicalExam" as keyof Step4Data,
        title: "MEDICAL EXAMINATION REPORT",
        description:
          "Official PRA Medical Form accomplished by a licensed physician.",
        required: true,
      },
    ],
  },
];
