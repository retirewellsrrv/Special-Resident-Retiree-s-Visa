import { useState } from "react";
import {
  Step1Data,
  Step2Data,
  Step4Data,
  ServicePlan,
} from "@/components/applicant/application/types";

export function useSRRVApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: "",
    birthday: "",
    sex: "",
    nationality: "",
    maritalStatus: "",
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    email: "",
    phoneCode: "+1",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phAddress: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  const [selectedService, setSelectedService] = useState<ServicePlan>("");

  const [step4Data, setStep4Data] = useState<Step4Data>({
    passportBio: { file: null, name: "" },
    validVisa: { file: null, name: "" },
    nbiClearance: { file: null, name: "" },
    pensionCert: { file: null, name: "" },
    medicalExam: { file: null, name: "" },
  });

  const handleStep1Change = (field: keyof Step1Data, value: string) =>
    setStep1Data((prev) => ({ ...prev, [field]: value }));

  const handleStep2Change = (field: keyof Step2Data, value: string) =>
    setStep2Data((prev) => ({ ...prev, [field]: value }));

  const handleDocUpload = (key: keyof Step4Data, file: File) =>
    setStep4Data((prev) => ({ ...prev, [key]: { file, name: file.name } }));

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Last step — assemble and log payload
    const payload = {
      personal: step1Data,
      contact: step2Data,
      selectedService,
      documents: Object.fromEntries(
        Object.entries(step4Data).map(([key, val]) => [
          key,
          {
            name: val.name,
            size: val.file?.size ?? null,
            type: val.file?.type ?? null,
          },
        ]),
      ),
    };

    console.log("📋 SRRV Application Payload:", payload);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const isLastStep = currentStep === 4;

  return {
    currentStep,
    setCurrentStep,
    step1Data,
    step1Change: handleStep1Change,
    step2Data,
    step2Change: handleStep2Change,
    selectedService,
    setSelectedService,
    step4Data,
    docUpload: handleDocUpload,
    next: handleNext,
    back: handleBack,
    isLastStep,
  };
}
