import { useState, useCallback } from "react";
import {
  Step1Data,
  Step2Data,
  Step4Data,
  ServiceType,
} from "@/components/applicant/application/types";
import { applicationFormSchema } from "@/schemas/application";

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

  const [selectedService, setSelectedService] = useState<ServiceType>("");

  const [step4Data, setStep4Data] = useState<Step4Data>({
    passportBio: { file: null, name: "" },
    validVisa: { file: null, name: "" },
    nbiClearance: { file: null, name: "" },
    pensionCert: { file: null, name: "" },
    medicalExam: { file: null, name: "" },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

  const validateForm = useCallback((): Record<string, string> => {
    const formData = {
      name: step1Data.name,
      birthday: step1Data.birthday,
      sex: step1Data.sex as "male" | "female" | "",
      nationality: step1Data.nationality,
      maritalStatus: step1Data.maritalStatus,
      email: step2Data.email,
      phoneNumber: step2Data.phoneNumber,
      streetAddress: step2Data.streetAddress,
      city: step2Data.city,
      state: step2Data.state,
      zip: step2Data.zip,
      country: step2Data.country,
      phAddress: step2Data.phAddress || null,
      emergencyName: step2Data.emergencyName,
      emergencyRelationship: step2Data.emergencyRelationship,
      emergencyPhone: step2Data.emergencyPhone,
      serviceType: selectedService as "basic" | "premium" | "vip" | "",
    };

    const result = applicationFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const fieldName = issue.path[0] as string;
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return fieldErrors;
    }

    setErrors({});
    return {};
  }, [step1Data, step2Data, selectedService]);

  const getStepErrors = useCallback(
    (step: number): Record<string, string> => {
      // Only show errors for steps that have been submitted (attempted to validate)
      if (!submittedSteps.has(step)) {
        return {};
      }
      if (step === 1) {
        const step1Fields = [
          "name",
          "birthday",
          "sex",
          "nationality",
          "maritalStatus",
        ];
        return Object.fromEntries(
          Object.entries(errors).filter(([key]) => step1Fields.includes(key)),
        );
      }
      if (step === 2) {
        const step2Fields = [
          "email",
          "phoneNumber",
          "streetAddress",
          "city",
          "state",
          "zip",
          "country",
          "phAddress",
          "emergencyName",
          "emergencyRelationship",
          "emergencyPhone",
        ];
        return Object.fromEntries(
          Object.entries(errors).filter(([key]) => step2Fields.includes(key)),
        );
      }
      if (step === 3) {
        const step3Fields = ["serviceType"];
        return Object.fromEntries(
          Object.entries(errors).filter(([key]) => step3Fields.includes(key)),
        );
      }
      return errors;
    },
    [errors, submittedSteps],
  );

  const handleStep1Change = (field: keyof Step1Data, value: string) => {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep2Change = (field: keyof Step2Data, value: string) => {
    setStep2Data((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocUpload = (key: keyof Step4Data, file: File) =>
    setStep4Data((prev) => ({ ...prev, [key]: { file, name: file.name } }));

  const handleNext = () => {
    const validationErrors = validateForm();

    // Define fields for each step
    const stepFields: Record<number, string[]> = {
      1: ["name", "birthday", "sex", "nationality", "maritalStatus"],
      2: [
        "email",
        "phoneNumber",
        "streetAddress",
        "city",
        "state",
        "zip",
        "country",
        "phAddress",
        "emergencyName",
        "emergencyRelationship",
        "emergencyPhone",
      ],
      3: ["serviceType"],
    };

    const stepErrors: Record<string, string> = {};
    if (stepFields[currentStep]) {
      stepFields[currentStep].forEach((field) => {
        if (validationErrors[field]) {
          stepErrors[field] = validationErrors[field];
        }
      });
    } else {
      // For step 4 or any other, consider all errors (though step 4 shouldn't have its own fields)
      Object.assign(stepErrors, validationErrors);
    }

    // Mark current step as submitted
    setSubmittedSteps((prev) => new Set(prev).add(currentStep));

    if (Object.keys(stepErrors).length > 0) {
      // Errors already set by validateForm, block navigation
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Last step - submit
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

  const stepErrors = getStepErrors(currentStep);
  const hasStepErrors = Object.keys(stepErrors).length > 0;
  const isFormValid = Object.keys(errors).length === 0;

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
    errors: stepErrors,
    hasStepErrors,
    isFormValid,
  };
}