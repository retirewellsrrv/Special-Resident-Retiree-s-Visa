"use client";

import { useEffect, useState, useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxInput,
} from "@/components/ui/combobox";
import {
  getProfile,
  updateApplicantProfile,
} from "@/actions/applicant/profile";
import type { ApplicantProfileData } from "@/actions/applicant/profile";
import { User, Save, Mail, Calendar, Globe, CheckCircle2 } from "lucide-react";

const INPUT_CLASS =
  "border-0 border-b border-neutral-300 rounded-none focus-visible:ring-0 focus-visible:border-[#8B1A2B] px-0 py-2 bg-transparent placeholder:text-neutral-400";

const LABEL_CLASS = "text-sm font-medium text-neutral-700 mb-1.5 block";

const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
];

function ApplicantProfileContent() {
  const isSetup = useSearchParams().get("setup") === "1";
  const [profile, setProfile] = useState<ApplicantProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    sex: "",
    nationality: "",
    marital_status: "",
  });

  const [state, formAction, pending] = useActionState(updateApplicantProfile, {
    error: null,
    success: false,
  });

  useEffect(() => {
    getProfile().then((result) => {
      if (result) {
        setProfile(result);
        setFormData({
          name: result.name,
          birthday: result.birthday,
          sex: result.sex,
          nationality: result.nationality,
          marital_status: result.marital_status,
        });
      }
      setLoading(false);
    });
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card className="rounded-xl border border-brand-neutral-200 shadow-sm overflow-hidden">
          <div className="h-2 bg-[#8B1A2B]" />
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-neutral-800">
          My Profile
        </h1>
        <p className="text-sm text-brand-neutral-400 mt-1">
          View and update your personal information.
        </p>
      </div>

      {isSetup && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
          Welcome! Please complete your profile details below to continue.
        </div>
      )}

      <Card className="rounded-xl border border-[#8B1A2B]/20 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#8B1A2B] text-white px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">
                Personal Details
              </CardTitle>
              <p className="text-sm text-white/80 mt-0.5">
                Ensure all information matches your passport exactly.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form action={formAction} className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#8B1A2B]/5 border border-[#8B1A2B]/10">
              <div className="size-10 rounded-full bg-[#8B1A2B]/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#8B1A2B]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8B1A2B]/60 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-brand-neutral-800">
                  {profile?.email ?? "---"}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className={cn(LABEL_CLASS, "text-[#8B1A2B]/80")}>
                Full Name (As shown in Passport)
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full legal name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="birthday" className={cn(LABEL_CLASS, "text-[#8B1A2B]/80")}>
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B1A2B]/40 pointer-events-none" />
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => updateField("birthday", e.target.value)}
                    className={cn(INPUT_CLASS, "pl-5")}
                  />
                </div>
              </div>
              <div>
                <Label className={cn(LABEL_CLASS, "text-[#8B1A2B]/80")}>Sex</Label>
                <Combobox
                  value={formData.sex}
                  onValueChange={(v) => v && updateField("sex", v)}
                >
                  <ComboboxInput
                    className={INPUT_CLASS}
                    placeholder="Select Sex"
                    name="sex"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxItem value="male">Male</ComboboxItem>
                      <ComboboxItem value="female">Female</ComboboxItem>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nationality" className={cn(LABEL_CLASS, "text-[#8B1A2B]/80")}>
                  Nationality
                </Label>
                <div className="relative">
                  <Globe className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B1A2B]/40 pointer-events-none" />
                  <Input
                    id="nationality"
                    name="nationality"
                    placeholder="e.g. United Kingdom"
                    value={formData.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    className={cn(INPUT_CLASS, "pl-5")}
                  />
                </div>
              </div>
              <div>
                <Label className={cn(LABEL_CLASS, "text-[#8B1A2B]/80")}>Marital Status</Label>
                <Combobox
                  value={formData.marital_status}
                  onValueChange={(v) => v && updateField("marital_status", v)}
                >
                  <ComboboxInput
                    className={INPUT_CLASS}
                    placeholder="Select Status"
                    name="marital_status"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {MARITAL_OPTIONS.map((opt) => (
                        <ComboboxItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Profile updated successfully.
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <Button
                type="submit"
                disabled={pending}
                className="bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-8 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {pending ? (
                  <>
                    <Spinner className="size-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicantProfilePage() {
  return (
    <Suspense fallback={null}>
      <ApplicantProfileContent />
    </Suspense>
  );
}
