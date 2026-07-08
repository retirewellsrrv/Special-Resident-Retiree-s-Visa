"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import {
  CreditCard,
  ConciergeBell,
  FileText,
  ShieldCheck,
  Banknote,
  Stethoscope,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, PenLine, Flag, Phone, Mail, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplicantDashboard } from "@/actions/applicant/application";
import type { DashboardData } from "@/actions/applicant/application";

const APPLICATION_STEPS = [
  { id: 1, label: "Initiation" },
  { id: 2, label: "Deposit" },
  { id: 3, label: "Verification" },
  { id: 4, label: "Issuance" },
];

const STATUS_TO_STEP_INDEX: Record<string, number> = {
  pending: 0,
  processing: 2,
  paused: 2,
  approved: 3,
  rejected: -1,
};

const CONCIERGE_INFO = {
  name: "Maria Santos",
  role: "Senior Concierge Officer",
  email: "maria.santos@pra.gov.ph",
  phone: "+63 (2) 8888-1234",
  location: "PRA Main Office, Makati City",
};

const DOC_ICONS: Record<string, typeof FileText> = {
  passport: FileText,
  medical: Stethoscope,
  pension: Banknote,
  nbi: ShieldCheck,
  visa: FileText,
};

const DOC_LABELS: Record<string, string> = {
  passport: "Valid Passport (Main Applicant)",
  medical: "Medical Clearance Certificate",
  pension: "Bank Deposit Certification",
  nbi: "NBI / Police Clearance",
  visa: "Visa Documentation",
};

function documentToStatus(docStatus: string): string {
  if (docStatus === "accepted") return "verified";
  if (docStatus === "rejected" || docStatus === "action need") return "action_required";
  return "pending";
}

export default function ApplicantDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicantDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-brand-neutral-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-44" />
            </div>
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg bg-brand-neutral-50 ${i === 3 ? "sm:col-span-2" : ""}`}>
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const application = data?.application ?? null;
  const documents = data?.documents ?? [];
  const payment = data?.payment ?? null;
  const hasPayment = !!payment;
  const currentStepIndex = application
    ? application.status === "pending" && hasPayment
      ? 1
      : STATUS_TO_STEP_INDEX[application.status] ?? 0
    : 0;
  const isRejected = application?.status === "rejected";
  const progress = application?.status === "approved"
    ? 100
    : currentStepIndex >= 0
      ? Math.round((currentStepIndex / (APPLICATION_STEPS.length - 1)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-neutral-800">
          Welcome back!
        </h1>
        <p className="text-sm text-brand-neutral-400 mt-1">
          Track your SRRV application status and requirements.
        </p>
      </div>

      {/* ── Card 1: Application Status Progress ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#8B1A2B] uppercase">
                Current Status
              </p>
              <h2 className="text-xl font-bold text-brand-neutral-800 mt-1">
                Application Status
              </h2>
              <p className="text-sm text-brand-neutral-400 mt-1">
                Your application code:{" "}
                <span className="font-mono font-medium text-brand-neutral-600">
                  {application?.application_code ?? "---"}
                </span>
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8B1A2B] bg-[#8B1A2B]/10 border border-[#8B1A2B]/20 rounded-md px-3 py-1.5 whitespace-nowrap">
              {progress}% Complete
            </span>
          </div>

          {!application ? (
            <div className="p-4 rounded-lg bg-brand-neutral-50 border border-brand-neutral-200 text-brand-neutral-500 text-sm">
              You haven't submitted an application yet.{' '}
              <a href="/applicant/application" className="text-[#8B1A2B] font-medium hover:underline">
                Start your application
              </a>
            </div>
          ) : isRejected ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              Your application has been rejected. Please contact support for more information.
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="absolute top-4 left-0 right-0 h-px bg-brand-neutral-200" />
                <div
                  className="absolute top-4 left-0 h-px bg-[#8B1A2B] transition-all"
                  style={{
                    width: `${APPLICATION_STEPS.length > 1 ? (currentStepIndex / (APPLICATION_STEPS.length - 1)) * 100 : 0}%`,
                  }}
                />
                <div className="flex items-center justify-between relative">
                  {APPLICATION_STEPS.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const StepIcon = isDone ? Check : isCurrent ? PenLine : Flag;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center gap-2 bg-white px-1"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            isDone || isCurrent
                              ? "bg-[#8B1A2B] text-white"
                              : "bg-white border border-brand-neutral-200 text-brand-neutral-300",
                          )}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium whitespace-nowrap",
                            isCurrent
                              ? "text-[#8B1A2B] font-semibold"
                              : isDone
                                ? "text-[#8B1A2B]/70"
                                : "text-brand-neutral-400",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-brand-neutral-100">
                <p className="text-sm text-brand-neutral-600 leading-relaxed">
                  Your application is currently at the{" "}
                  <span className="font-semibold text-brand-neutral-800">
                    {APPLICATION_STEPS[currentStepIndex]?.label ?? "Unknown"}
                  </span>{" "}
                  stage. We'll notify you as soon as it moves to the next step.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Card 2: Document Checklist ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              Document Checklist
            </CardTitle>
          </div>
          <p className="text-sm text-brand-neutral-400">
            Track the verification status of your submitted documents.
          </p>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-brand-neutral-400">No documents submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const displayStatus = documentToStatus(doc.status);
                const Icon = DOC_ICONS[doc.type] ?? FileText;
                const label = DOC_LABELS[doc.type] ?? doc.type.charAt(0).toUpperCase() + doc.type.slice(1);

                const isVerified = displayStatus === "verified";
                const isActionRequired = displayStatus === "action_required";

                const row = (
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 rounded-lg border",
                      isActionRequired
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-brand-neutral-200",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-brand-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-neutral-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-neutral-800 truncate">
                          {label}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-0.5 truncate",
                            isActionRequired
                              ? "text-[#8B1A2B]"
                              : "text-brand-neutral-400",
                          )}
                        >
                          Uploaded: {new Date(doc.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusChip
                        status={displayStatus}
                        icon={isVerified ? CheckCircle2 : isActionRequired ? AlertTriangle : Clock}
                      />
                      {isActionRequired && (
                        <ArrowRight className="w-4 h-4 text-[#8B1A2B]" />
                      )}
                    </div>
                  </div>
                );

                return isActionRequired ? (
                  <Link
                    key={doc.type}
                    href={`/applicant/dashboard/documents/${doc.type}`}
                    className="block transition-opacity hover:opacity-80"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={doc.type}>{row}</div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Payment Details ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              Payment Details
            </CardTitle>
            {payment && <StatusChip status={payment.status} />}
          </div>
        </CardHeader>
        <CardContent>
          {!payment ? (
            <p className="text-sm text-brand-neutral-400">No payment information available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <CreditCard className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                    Amount Paid
                  </p>
                  <p className="text-lg font-bold text-brand-neutral-800 mt-0.5">
                    ₱{Number(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <Package className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                    Service Type
                  </p>
                  <p className="text-sm font-semibold text-brand-neutral-700 mt-0.5 capitalize">
                    {application?.service_type === "basic"
                      ? "Basic"
                      : application?.service_type === "premium"
                        ? "Premium"
                        : application?.service_type === "vip"
                          ? "VIP"
                          : application?.service_type ?? "---"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <Building2 className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                    Payment Method
                  </p>
                  <p className="text-sm font-semibold text-brand-neutral-700 mt-0.5 capitalize">
                    {payment.payment_method.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <FileText className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                    Transaction Code
                  </p>
                  <p className="text-sm font-semibold text-brand-neutral-700 mt-0.5 font-mono">
                    {payment.transaction_code}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 4: Concierge Information ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ConciergeBell className="w-5 h-5 text-[#8B1A2B]" />
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              Concierge Information
            </CardTitle>
          </div>
          <p className="text-sm text-brand-neutral-400">
            Your dedicated concierge is assigned to assist you with your relocation.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8B1A2B]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-[#8B1A2B]">
                  {CONCIERGE_INFO.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-neutral-800">
                  {CONCIERGE_INFO.name}
                </p>
                <p className="text-xs text-brand-neutral-500">
                  {CONCIERGE_INFO.role}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <Phone className="w-4 h-4 text-brand-neutral-400" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium">Phone</p>
                  <p className="text-sm font-medium text-brand-neutral-700">
                    {CONCIERGE_INFO.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-neutral-50">
                <Mail className="w-4 h-4 text-brand-neutral-400" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium">Email</p>
                  <p className="text-sm font-medium text-brand-neutral-700">
                    {CONCIERGE_INFO.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-neutral-50 sm:col-span-2">
                <MapPin className="w-4 h-4 text-brand-neutral-400" />
                <div>
                  <p className="text-xs text-brand-neutral-400 font-medium">Location</p>
                  <p className="text-sm font-medium text-brand-neutral-700">
                    {CONCIERGE_INFO.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
