"use client";

import { Suspense, useEffect, useState, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, PenLine, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplicantDashboard, retryPaymentAction } from "@/actions/applicant/application";
import type { DashboardData, RetryPaymentState } from "@/actions/applicant/application";
import { retryConsultationPaymentAction } from "@/actions/applicant/consultation";
import type { RetryConsultationPaymentState } from "@/actions/applicant/consultation";
import { Button } from "@/components/ui/button";

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

const DOC_ICONS: Record<string, typeof FileText> = {
  passport: FileText,
  medical: Stethoscope,
  pension: Banknote,
  nbi: ShieldCheck,
  visa: FileText,
};

const DOC_LABELS: Record<string, string> = {
  passport: "Valid Passport",
  photo_2x2: "2×2 ID Photo",
  pra_application: "PRA Application Form",
  medical: "Medical Clearance Certificate",
  police: "Police Clearance",
  bicc: "Bureau of Immigration Clearance Certificate",
  bank_cert: "Bank Certification",
  proof_payment: "Proof of Payment",
  proof_pension: "Proof of Pension",
  proof_relationship: "Proof of Relationship (Dependents)",
};

function documentToStatus(docStatus: string): string {
  if (docStatus === "accepted") return "verified";
  if (docStatus === "rejected" || docStatus === "action need") return "action_required";
  return "pending";
}

export default function ApplicantDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const consultationSuccess =
    useSearchParams().get("consultation") === "success";
  const [showConsultationAlert, setShowConsultationAlert] =
    useState(consultationSuccess);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryState, retryAction, retryPending] = useActionState<
    RetryPaymentState,
    FormData
  >(retryPaymentAction, { error: null, success: false });
  const [consultRetryState, consultRetryAction, consultRetryPending] =
    useActionState<RetryConsultationPaymentState, FormData>(
      retryConsultationPaymentAction,
      { error: null, success: false },
    );

  useEffect(() => {
    if (!consultationSuccess) return;
    const timer = setTimeout(() => setShowConsultationAlert(false), 5000);
    return () => clearTimeout(timer);
  }, [consultationSuccess]);

  useEffect(() => {
    getApplicantDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (retryState.success && retryState.invoiceUrl) {
      window.location.href = retryState.invoiceUrl;
    }
  }, [retryState]);

  useEffect(() => {
    if (consultRetryState.success && consultRetryState.invoiceUrl) {
      window.location.href = consultRetryState.invoiceUrl;
    }
  }, [consultRetryState]);

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
  const consultationPayment = data?.consultationPayment ?? null;
  const canRetry = data?.canRetry ?? false;
  const canRetryConsultationPayment =
    consultationPayment?.status === "pending" ||
    consultationPayment?.status === "cancelled" ||
    consultationPayment?.status === "failed";
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
      {showConsultationAlert && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertTitle>Consultation submitted successfully</AlertTitle>
          <AlertDescription>
            Your consultation request has been received. Our team will get back
            to you to confirm your schedule.
          </AlertDescription>
        </Alert>
      )}

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
            <div className="flex items-center gap-2">
              {(application?.status === "pending" || application?.status === "rejected") && (
                <a
                  href="/applicant/application"
                  className="text-xs font-semibold text-white bg-[#8B1A2B] hover:bg-[#6f1522] rounded-md px-3 py-1.5 transition-colors"
                >
                  Update
                </a>
              )}
              <span className="text-xs font-semibold text-[#8B1A2B] bg-[#8B1A2B]/10 border border-[#8B1A2B]/20 rounded-md px-3 py-1.5 whitespace-nowrap">
                {progress}% Complete
              </span>
            </div>
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
                        className="flex flex-col items-center gap-2 bg-white px-0.5 sm:px-1"
                      >
                        <div
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors",
                            isDone || isCurrent
                              ? "bg-[#8B1A2B] text-white"
                              : "bg-white border border-brand-neutral-200 text-brand-neutral-300",
                          )}
                        >
                          <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span
                          className={cn(
                            "hidden sm:inline text-xs font-medium",
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
          {!payment && !consultationPayment ? (
            <p className="text-sm text-brand-neutral-400">No payment information available.</p>
          ) : (
            <>
              {payment && (
                <>
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

                  {canRetry && (
                    <div className="mt-4 space-y-2">
                      {retryState.error && (
                        <p className="text-sm text-red-600">{retryState.error}</p>
                      )}
                      <form action={retryAction}>
                        <Button
                          type="submit"
                          disabled={retryPending}
                          className="w-full"
                        >
                          {retryPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting to payment...
                            </>
                          ) : (
                            "Retry Payment"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </>
              )}

              {consultationPayment && (
                <div className="border-t border-brand-neutral-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-neutral-400">
                      Consultation Fee
                    </p>
                    <StatusChip status={consultationPayment.status} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
                      <CreditCard className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                          Amount Paid
                        </p>
                        <p className="text-base font-bold text-brand-neutral-800 mt-0.5">
                          ₱{Number(consultationPayment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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
                          {consultationPayment.payment_method.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50 sm:col-span-2">
                      <FileText className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                          Transaction Code
                        </p>
                        <p className="text-sm font-semibold text-brand-neutral-700 mt-0.5 font-mono">
                          {consultationPayment.transaction_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {canRetryConsultationPayment && (
                    <div className="mt-4 space-y-2">
                      {consultRetryState.error && (
                        <p className="text-sm text-red-600">
                          {consultRetryState.error}
                        </p>
                      )}
                      <form action={consultRetryAction}>
                        <Button
                          type="submit"
                          disabled={consultRetryPending}
                          className="w-full"
                        >
                          {consultRetryPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting to payment...
                            </>
                          ) : (
                            "Retry Consultation Payment"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
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
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data?.concierges && data.concierges.length > 0 ? (
            <ul className="space-y-3">
              {data.concierges.map((concierge) => (
                <li
                  key={concierge.user_id}
                  className="flex items-start gap-3 rounded-lg border border-brand-neutral-100 bg-brand-neutral-50/50 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B1A2B]/10 text-sm font-semibold text-[#8B1A2B]">
                    {concierge.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-neutral-800">
                      {concierge.name}
                    </p>
                    <p className="truncate text-sm text-brand-neutral-400">
                      {concierge.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-neutral-400">
              No concierge information available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
