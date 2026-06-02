"use client";

import Image from "next/image";
import markerImage from "@/assets/images/marker.png";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Mail, Phone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { steps } from "@/components/applicant/application/constants";
import { Step1 } from "@/components/applicant/application/Step1";
import { Step2 } from "@/components/applicant/application/Step2";
import { Step3 } from "@/components/applicant/application/Step3";
import { Step4 } from "@/components/applicant/application/Step4";
import { useSRRVApplicationForm } from "@/hooks/applicant/application/useSRRVApplicationForm";

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
  } = useSRRVApplicationForm();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f9f6f1] py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Form Card ── */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <CardContent className="p-10">
              {/* Step Indicator */}
              <div className="flex items-center gap-0 mb-6">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1.5">
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
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-px mx-3 mb-5 transition-colors",
                          step.id < currentStep
                            ? "bg-[#8B1A2B]/40"
                            : "bg-neutral-200",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="mb-6" />

              {/* Active step content */}
              {currentStep === 1 && (
                <Step1 data={step1Data} onChange={step1Change} />
              )}
              {currentStep === 2 && (
                <Step2 data={step2Data} onChange={step2Change} />
              )}
              {currentStep === 3 && (
                <Step3
                  selected={selectedService}
                  onSelect={setSelectedService}
                />
              )}
              {currentStep === 4 && (
                <Step4 data={step4Data} onUpload={docUpload} />
              )}

              {/* Navigation buttons */}
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
                    className="border-neutral-300 text-neutral-600 hover:bg-neutral-50 px-6 py-2.5 rounded-md font-semibold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={next}
                  className="bg-[#8B1A2B] hover:bg-[#6f1522] text-white px-7 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors"
                >
                  {isLastStep ? "Submit Application" : "Save & Continue"}
                  {!isLastStep && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
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
    </div>
  );
}
