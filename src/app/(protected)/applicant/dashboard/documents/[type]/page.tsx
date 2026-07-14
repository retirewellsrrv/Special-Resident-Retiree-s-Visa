"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, CheckCircle2, AlertCircle, ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApplicantDashboard } from "@/actions/applicant/application";
import { reuploadDocument } from "@/actions/applicant/document";
import type { DashboardData } from "@/actions/applicant/application";
import type { DocumentType } from "@/schemas/document";
import { CheckCircle2 as CheckCircle2Icon } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  passport: "Valid Passport (Main Applicant)",
  medical: "Medical Clearance Certificate",
  pension: "Bank Deposit Certification",
  nbi: "NBI / Police Clearance",
  visa: "Visa Documentation",
};

const DOC_DESCRIPTIONS: Record<string, string> = {
  passport: "Colored scan of the main identification page showing photo and details.",
  visa: "Page containing your current Bureau of Immigration entry stamp.",
  nbi: "Clearance from home country or NBI if staying in PH for +1 month.",
  pension: "Official document proving monthly pension of $800+ or $10,000 deposit.",
  medical: "Official PRA Medical Form accomplished by a licensed physician.",
};

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif";

function documentToStatus(docStatus: string): string {
  if (docStatus === "accepted") return "verified";
  if (docStatus === "rejected" || docStatus === "action need") return "action_required";
  return "pending";
}

export default function ReuploadDocumentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validTypes: DocumentType[] = ["passport", "visa", "nbi", "pension", "medical"];
  const isValidType = validTypes.includes(type as DocumentType);

  useEffect(() => {
    getApplicantDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const doc = data?.documents.find((d) => d.type === type);
  const displayStatus = doc ? documentToStatus(doc.status) : "pending";
  const label = DOC_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
  const description = DOC_DESCRIPTIONS[type] ?? "";
  const isActionRequired = displayStatus === "action_required";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("docType", type);
    formData.set("file", selectedFile);

    const result = await reuploadDocument({ error: null, success: false }, formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/applicant/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidType || !doc) {
    return (
      <div className="space-y-6">
        <Link
          href="/applicant/dashboard"
          className="inline-flex items-center gap-1 text-sm text-brand-neutral-500 hover:text-[#8B1A2B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
          <CardContent className="p-6 text-center text-brand-neutral-400">
            Document not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/applicant/dashboard"
        className="inline-flex items-center gap-1 text-sm text-brand-neutral-500 hover:text-[#8B1A2B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-brand-neutral-800">
              {label}
            </CardTitle>
            <StatusChip
              status={displayStatus}
              icon={displayStatus === "verified" ? CheckCircle2Icon : isActionRequired ? AlertTriangle : Clock}
            />
          </div>
          <p className="text-sm text-brand-neutral-400">{description}</p>
          {doc.status !== "accepted" && (
            <p className="text-xs text-brand-neutral-400 mt-1">
              Current file: {doc.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                selectedFile
                  ? "border-green-300 bg-green-50/50"
                  : dragOver
                    ? "border-[#8B1A2B] bg-[#8B1A2B]/5"
                    : "border-brand-neutral-200 hover:border-[#8B1A2B]/30 hover:bg-brand-neutral-50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_TYPES}
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle2Icon className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-brand-neutral-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-brand-neutral-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    className="text-xs"
                  >
                    Choose a different file
                  </Button>
                </div>
              ) : (
                <div
                  className="space-y-2 cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-brand-neutral-300 mx-auto" />
                  {dragOver ? (
                    <p className="text-sm font-medium text-[#8B1A2B]">
                      Drop your file here
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-brand-neutral-600">
                      Drag & drop or click to upload a new document
                    </p>
                  )}
                  <p className="text-xs text-brand-neutral-400">
                    PDF, DOC, DOCX, JPG, PNG, GIF, BMP, WEBP, TIFF accepted
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || submitting}
                className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
              >
                {submitting ? "Uploading..." : "Upload & Resubmit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/applicant/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
