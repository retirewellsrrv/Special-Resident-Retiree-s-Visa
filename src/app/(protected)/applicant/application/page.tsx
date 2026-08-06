"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, CalendarX2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { steps } from "@/components/applicant/application/constants";
import { Step1 } from "@/components/applicant/application/Step1";
import { Step2 } from "@/components/applicant/application/Step2";
import { Step3 } from "@/components/applicant/application/Step3";
import { Step4 } from "@/components/applicant/application/Step4";
import { Step5 } from "@/components/applicant/application/Step5";
import { ApplicationSidebar } from "@/components/applicant/application/application-sidebar";
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
    fillTestData,
    step4Data,
    docUpload,
    next,
    back,
    isLastStep,
    errors,
    submitError,
    showConfirm,
    showSuccess,
    confirmSubmit,
    cancelSubmit,
    dismissSuccess,
    isLoadingProfile,
    isConsultationLoading,
    consultationApproved,
    hasConsultation,
    isSubmitting,
    existingApplication,
    startEditing,
  } = useSRRVApplicationForm();

  const consultationBlocked =
    !isLoadingProfile &&
    !isConsultationLoading &&
    !consultationApproved &&
    !existingApplication;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Main Form Card ── */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <CardContent className="p-6 md:p-10">
              {consultationBlocked ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
                    <CalendarX2 className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800 mt-4">
                    Consultation Required
                  </h2>
                  <p className="text-sm text-neutral-500 leading-relaxed mt-2 max-w-md mx-auto">
                    {hasConsultation
                      ? "Your consultation request must be accepted before you can start your SRRV application. Our team is reviewing your request and will notify you once it's approved."
                      : "You need to request a consultation before you can start your SRRV application. Our team will review your request and notify you once it's approved."}
                  </p>
                  <Button asChild className="mt-6 bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-6 py-2.5 rounded-md font-semibold">
                    <Link href="/applicant/consultation">
                      {hasConsultation ? "View Consultation" : "Request a Consultation"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
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
                      className="flex flex-col items-center gap-1.5 bg-white px-0.5 md:px-1"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-colors",
                          step.id === currentStep
                            ? "bg-[#8B1A2B] text-white"
                            : step.id < currentStep
                              ? "bg-[#8B1A2B] text-white opacity-60"
                              : "bg-neutral-200 text-neutral-500",
                        )}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={cn(
                          "hidden md:inline text-xs font-medium",
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

              <div className="border-t border-red-200 mb-6" />

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
                <Step3 data={step4Data} onUpload={docUpload} errors={errors} />
              )}
              {!isLoadingProfile && currentStep === 4 && (
                <Step4
                  step1Data={step1Data}
                  step2Data={step2Data}
                  step4Data={step4Data}
                  payment={existingApplication?.payment ?? null}
                  canRetry={existingApplication?.canRetry ?? false}
                />
              )}
              {!isLoadingProfile && currentStep === 5 && existingApplication && (
                <Step5 data={existingApplication} onEdit={startEditing} />
              )}

              {/* ── TEST: auto-fill button (remove after testing) ── */}
              {currentStep >= 1 && currentStep <= 2 && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillTestData}
                    className="border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                  >
                    Fill Test Data
                  </Button>
                </div>
              )}

              {/* Submit error banner */}
              {submitError && (
                <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Navigation buttons */}
              {currentStep !== 5 && (
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
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <ApplicationSidebar />
      </div>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !open && cancelSubmit()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader className="bg-brand-primary-50 -mx-4 -mt-4 rounded-t-xl p-4 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.15)] relative z-10">
            <AlertDialogTitle className="font-bold">Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              {existingApplication
                ? "Are you sure the updated details are correct? Your application will be re-submitted for review."
                : "Are you sure the details you provided are correct? You will not be able to modify your application after submission."}
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

      <AlertDialog open={showSuccess}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader className="bg-brand-primary-50 -mx-4 -mt-4 rounded-t-xl p-4 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.15)] relative z-10">
            <AlertDialogTitle className="font-bold">Update Successful</AlertDialogTitle>
            <AlertDialogDescription>
              Your application has been updated successfully. You will be
              redirected to your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <AlertDialogAction
              onClick={dismissSuccess}
              className="bg-[#8B1A2B] hover:bg-[#6f1522]"
            >
              Continue
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
