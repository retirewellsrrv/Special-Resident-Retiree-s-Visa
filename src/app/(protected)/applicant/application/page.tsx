"use client";

import Image from "next/image";
import markerImage from "@/assets/images/marker.png";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Mail, Phone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

import { steps } from "@/components/applicant/application/constants";
import { Step1 } from "@/components/applicant/application/Step1";
import { Step2 } from "@/components/applicant/application/Step2";
import { Step3 } from "@/components/applicant/application/Step3";
import { Step4 } from "@/components/applicant/application/Step4";
import { Step5 } from "@/components/applicant/application/Step5";
import { Step6 } from "@/components/applicant/application/Step6";
import { useSRRVApplicationForm } from "@/hooks/applicant/application/useApplicationForm";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function SRRVApplicationPage() {
  const {
    currentStep,
    step1Data,
    step1Change,
    step2Data,
    step2Change,
    selectedService,
    setSelectedService,
    step4Data,
    docUpload,
    next,
    back,
    isLastStep,
    errors,
    submitError,
    showConfirm,
    confirmSubmit,
    cancelSubmit,
    isLoadingProfile,
    isSubmitting,
    existingApplication,
  } = useSRRVApplicationForm();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Main Form Card ── */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <CardContent className="p-10">
              {/* Step Indicator */}
              <div className="relative mb-6">
                <div className="absolute top-4 left-0 right-0 h-px bg-neutral-200" />
                <div
                  className="absolute top-4 left-0 h-px bg-[#8B1A2B]/40 transition-all"
                  style={{ width: `${steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0}%` }}
                />
                <div className="flex items-center justify-between relative">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex flex-col items-center gap-1.5 bg-white px-1"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                          step.id === currentStep
                            ? "bg-[#8B1A2B] text-white"
                            : step.id < currentStep
                              ? "bg-[#8B1A2B] text-white opacity-60"
                              : "bg-neutral-200 text-neutral-500",
                        )}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          step.id === currentStep
                            ? "text-[#8B1A2B]"
                            : "text-neutral-400",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Loading state for profile data */}
              {isLoadingProfile && (
                <div className="space-y-6">
                  <div className="mb-6 space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Active step content */}
              {!isLoadingProfile && currentStep === 1 && (
                <Step1
                  data={step1Data}
                  onChange={step1Change}
                  errors={errors}
                />
              )}
              {!isLoadingProfile && currentStep === 2 && (
                <Step2
                  data={step2Data}
                  onChange={step2Change}
                  errors={errors}
                />
              )}
              {!isLoadingProfile && currentStep === 3 && (
                <Step3
                  selected={selectedService}
                  onSelect={setSelectedService}
                  error={errors.service_type}
                />
              )}
              {!isLoadingProfile && currentStep === 4 && (
                <Step4 data={step4Data} onUpload={docUpload} errors={errors} />
              )}
              {!isLoadingProfile && currentStep === 5 && (
                <Step5
                  step1Data={step1Data}
                  step2Data={step2Data}
                  selectedService={selectedService}
                  step4Data={step4Data}
                />
              )}
              {!isLoadingProfile && currentStep === 6 && existingApplication && (
                <Step6 data={existingApplication} />
              )}

              {/* Submit error banner */}
              {submitError && (
                <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Navigation buttons */}
              {currentStep !== 6 && (
                <div
                  className={cn(
                    "flex mt-8",
                    currentStep > 1 ? "justify-between" : "justify-end",
                  )}
                >
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={back}
                      disabled={isSubmitting}
                      className="border-neutral-300 text-neutral-600 hover:bg-neutral-50 px-6 py-2.5 rounded-md font-semibold flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={next}
                    disabled={isSubmitting}
                    className="bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-7 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-4" />
                        Processing...
                      </>
                    ) : isLastStep ? (
                      "Submit Application"
                    ) : (
                      <>
                        Save & Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="flex flex-col gap-5">
          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-[#8B1A2B] mb-1">
                Application Support
              </h2>
              <p className="text-sm text-neutral-500 mb-3 leading-relaxed">
                Need assistance with your SRRV application? Our consultants are
                available for real-time guidance.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      Email Assistance
                    </p>
                    <p className="text-sm text-neutral-500">
                      support@heritagetrust.ph
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      Phone Hotline
                    </p>
                    <p className="text-sm text-neutral-500">+63 2 8812 3456</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="relative w-full h-56 rounded-xl overflow-hidden">
                <Image
                  src={markerImage}
                  alt="Authorized PRB Marketer seal"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/60 to-transparent" />
              </div>
              <p className="text-xs font-semibold tracking-widest text-neutral-500 text-center uppercase">
                Authorized PRB Marketer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !open && cancelSubmit()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader className="bg-brand-primary-50 -mx-4 -mt-4 rounded-t-xl p-4 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.15)] relative z-10">
            <AlertDialogTitle className="font-bold">Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure the details you provided are correct? You will not be
              able to modify your application after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t-0 bg-white py-2 justify-items-center items-center">
            <AlertDialogCancel onClick={cancelSubmit}>
              Review Again
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-[#8B1A2B] hover:bg-[#6f1522]"
            >
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
