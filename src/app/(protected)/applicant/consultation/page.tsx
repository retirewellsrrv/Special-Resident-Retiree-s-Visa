"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { ApplicationSidebar } from "@/components/applicant/application/application-sidebar";
import {
  INPUT_CLASS,
  LABEL_CLASS,
} from "@/components/applicant/application/constants";
import { submitConsultationAction } from "@/actions/applicant/consultation";
import type { SubmitConsultationState } from "@/actions/applicant/consultation";

const MODES = [
  { value: "zoom_meeting", label: "Video Call (Zoom)" },
  { value: "google_meet", label: "Video Call (Google Meet)" },
  { value: "whatsApp", label: "WhatsApp Call" },
  { value: "phone_call", label: "Phone Call" },
  { value: "face_2_face", label: "Face-to-Face Meeting" },
];

const MODE_LABELS = Object.fromEntries(MODES.map((m) => [m.value, m.label]));

export default function ConsultationRequestPage() {
  const [state, formAction, isSubmitting] = useActionState<
    SubmitConsultationState,
    FormData
  >(submitConsultationAction, {
    error: null,
    fieldErrors: null,
    success: false,
  });
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null,
  );

  useEffect(() => {
    if (state.fieldErrors) {
      setFieldErrors(state.fieldErrors);
    } else if (state.success) {
      setFieldErrors(null);
    }
  }, [state]);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev?.[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const today = (() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  })();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Main Form Card ── */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <CardContent className="p-6 md:p-10">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#8B1A2B] mb-2">
                  Request a Consultation
                </h1>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Fill out the form below and our team will get back to you to
                  confirm your schedule.
                </p>
              </div>

              <div className="border-t border-neutral-200 mb-6" />

              {state.success && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Your consultation request has been received. We will confirm
                  your schedule shortly.
                </div>
              )}

              {state.error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {state.error}
                </div>
              )}

              <form action={formAction} className="space-y-6">
                <div>
                  <Label className={LABEL_CLASS}>
                    Mode of Communication
                  </Label>
                  <Combobox
                    name="mode_communication"
                    value={mode}
                    onValueChange={(v) => {
                      if (v) {
                        setMode(v);
                        clearFieldError("mode_communication");
                      }
                    }}
                    itemToStringLabel={(v) =>
                      (MODE_LABELS[v as string] as string) ?? String(v)
                    }
                  >
                    <ComboboxInput
                      className={cn(
                        INPUT_CLASS,
                        fieldErrors?.mode_communication && "border-red-500",
                      )}
                      placeholder="Select an option"
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {MODES.map((m) => (
                          <ComboboxItem key={m.value} value={m.value}>
                            {m.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {fieldErrors?.mode_communication && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.mode_communication}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="meeting-date" className={LABEL_CLASS}>
                    Preferred Date
                  </Label>
                  <Input
                    id="meeting-date"
                    name="meeting_date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      clearFieldError("meeting_date");
                    }}
                    className={cn(
                      INPUT_CLASS,
                      "text-neutral-700",
                      fieldErrors?.meeting_date && "border-red-500",
                    )}
                  />
                  {fieldErrors?.meeting_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.meeting_date}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="purpose" className={LABEL_CLASS}>
                    Purpose of Consultation
                  </Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="Briefly describe what you'd like to discuss..."
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      clearFieldError("purpose");
                    }}
                    className={cn(
                      INPUT_CLASS,
                      "resize-none min-h-[140px]",
                      fieldErrors?.purpose && "border-red-500",
                    )}
                  />
                  {fieldErrors?.purpose && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldErrors.purpose}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-7 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <ApplicationSidebar />
      </div>
    </div>
  );
}
