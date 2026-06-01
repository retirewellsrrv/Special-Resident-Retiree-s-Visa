import { CheckCircle2, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const generalReqs: string[] = [
  "Age 50 years and above (Active/Retirees)",
  "Time Deposit investment of US$10,000 to US$20,000",
  "Valid Passport and Medical Clearance",
  "Police Clearance from country of origin",
];

const requiredDocs: string[] = [
  "Original Valid Passport",
  "PRA Application Forms (Completed)",
  "Medical Certificate (DOH Form)",
  '12 photos (2" x 2")',
];

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-primary-500 mt-0.5 shrink-0" />
          <span className="text-ht-body-md text-brand-secondary-500">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EligibilitySection() {
  return (
    <section className="py-20 bg-brand-tertiary-500">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left copy */}
          <div>
            <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-4">
              SRRV Eligibility At A Glance
            </h2>
            <p className="text-ht-body-md text-brand-neutral-600 mb-6">
              Understanding the requirements is the first step toward your new
              life. Our team ensures you meet all criteria before submission.
            </p>
            <blockquote className="border-l-4 border-brand-primary-500 pl-4 text-brand-neutral-600 italic text-ht-body-md bg-brand-primary-50 py-3 pr-3 rounded-r">
              "We simplify the complex bureaucratic requirements into a clear,
              manageable checklist."
            </blockquote>
          </div>

          {/* General Requirements */}
          <Card className="rounded-lg border border-ht-outline-variant shadow-ht-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-primary-500 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-ht-label-md font-semibold uppercase tracking-wide">
                  General Requirements
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CheckList items={generalReqs} />
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="rounded-lg border border-ht-outline-variant shadow-ht-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-primary-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-ht-label-md font-semibold uppercase tracking-wide">
                  Required Documents
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CheckList items={requiredDocs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}