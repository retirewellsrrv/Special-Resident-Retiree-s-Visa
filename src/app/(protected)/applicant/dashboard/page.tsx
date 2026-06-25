"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, PenLine, Flag, Phone, Mail, MapPin } from "lucide-react";

const APPLICATION_STEPS = [
  { id: 1, label: "Initiation" },
  { id: 2, label: "Deposit" },
  { id: 3, label: "Verification" },
  { id: 4, label: "Issuance" },
];

const CURRENT_STEP_INDEX = 2;
const APPLICATION_PROGRESS = 75;

type DocStatus = "verified" | "action_required" | "pending";

const DOCUMENT_LIST: {
  key: string;
  label: string;
  icon: typeof FileText;
  status: DocStatus;
  note: string;
}[] = [
  {
    key: "passport",
    label: "Valid Passport (Main Applicant)",
    icon: FileText,
    status: "verified",
    note: "Uploaded: Oct 12, 2023",
  },
  {
    key: "medical",
    label: "Medical Clearance Certificate",
    icon: Stethoscope,
    status: "action_required",
    note: "Re-upload required: illegible seal",
  },
  {
    key: "pension",
    label: "Bank Deposit Certification",
    icon: Banknote,
    status: "pending",
    note: "Uploaded: 2 days ago",
  },
  {
    key: "nbi",
    label: "NBI / Police Clearance",
    icon: ShieldCheck,
    status: "verified",
    note: "Uploaded: Oct 12, 2023",
  },
];

const STATUS_CONFIG: Record<
  DocStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
    rowClass: string;
  }
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rowClass: "bg-white border-brand-neutral-200",
  },
  action_required: {
    label: "Action Required",
    icon: AlertTriangle,
    badgeClass: "bg-[#8B1A2B] text-white border-[#8B1A2B]",
    rowClass: "bg-red-50 border-red-200",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    badgeClass:
      "bg-brand-neutral-100 text-brand-neutral-500 border-brand-neutral-200",
    rowClass: "bg-white border-brand-neutral-200",
  },
};

const CONCIERGE_INFO = {
  name: "Maria Santos",
  role: "Senior Concierge Officer",
  email: "maria.santos@pra.gov.ph",
  phone: "+63 (2) 8888-1234",
  location: "PRA Main Office, Makati City",
};

export default function ApplicantDashboardPage() {
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
          {/* Header: label + title + percent badge */}
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
                  SRRV-****-****
                </span>
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8B1A2B] bg-[#8B1A2B]/10 border border-[#8B1A2B]/20 rounded-md px-3 py-1.5 whitespace-nowrap">
              {APPLICATION_PROGRESS}% Complete
            </span>
          </div>

          {/* Stepper */}
          <div className="relative mb-6">
            <div className="absolute top-4 left-0 right-0 h-px bg-brand-neutral-200" />
            <div
              className="absolute top-4 left-0 h-px bg-[#8B1A2B] transition-all"
              style={{
                width: `${(CURRENT_STEP_INDEX / (APPLICATION_STEPS.length - 1)) * 100}%`,
              }}
            />
            <div className="flex items-center justify-between relative">
              {APPLICATION_STEPS.map((step, idx) => {
                const isDone = idx < CURRENT_STEP_INDEX;
                const isCurrent = idx === CURRENT_STEP_INDEX;
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

          {/* Description */}
          <div className="pt-4 border-t border-brand-neutral-100">
            <p className="text-sm text-brand-neutral-600 leading-relaxed">
              Your application is currently at the{" "}
              <span className="font-semibold text-brand-neutral-800">
                {APPLICATION_STEPS[CURRENT_STEP_INDEX].label}
              </span>{" "}
              stage. We'll notify you as soon as it moves to the next step.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Document Checklist (redesigned to match Document Repository reference) ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              Document Checklist
            </CardTitle>
            <button className="text-sm font-medium text-[#8B1A2B] hover:underline">
              Upload New
            </button>
          </div>
          <p className="text-sm text-brand-neutral-400">
            Track the verification status of your submitted documents.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DOCUMENT_LIST.map((doc) => {
              const config = STATUS_CONFIG[doc.status];
              return (
                <div
                  key={doc.key}
                  className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-lg border",
                    config.rowClass,
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-neutral-100 flex items-center justify-center flex-shrink-0">
                      <doc.icon className="w-5 h-5 text-brand-neutral-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-neutral-800 truncate">
                        {doc.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5 truncate",
                          doc.status === "action_required"
                            ? "text-[#8B1A2B]"
                            : "text-brand-neutral-400",
                        )}
                      >
                        {doc.note}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap",
                      config.badgeClass,
                    )}
                  >
                    <config.icon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Payment Details ── */}
      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              Payment Details
            </CardTitle>
            <StatusChip status="pending" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-neutral-50">
              <CreditCard className="w-5 h-5 text-brand-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-brand-neutral-400 font-medium uppercase tracking-wide">
                  Amount Paid
                </p>
                <p className="text-lg font-bold text-brand-neutral-800 mt-0.5">
                  ₱ --,---
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
                  -- Service
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
                  -- --
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
                  ---
                </p>
              </div>
            </div>
          </div>
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
            Your dedicated concierge is assigned to assist you with your
            relocation.
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
