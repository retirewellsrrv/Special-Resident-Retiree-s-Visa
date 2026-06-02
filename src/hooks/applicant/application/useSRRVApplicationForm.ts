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
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    email: "",
    phoneCode: "+1",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phAddress: "",
    ecName: "",
    ecRelationship: "",
    ecPhone: "",
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
    if (currentStep < 4) setCurrentStep((s) => s + 1);
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
