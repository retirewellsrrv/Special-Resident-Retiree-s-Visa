import { useState, useCallback } from "react";
import {
  Step1Data,
  Step2Data,
  Step4Data,
  ServiceType,
} from "@/components/applicant/application/types";
import { applicationFormSchema } from "@/schemas/application";
import { step4FormSchema } from "@/schemas/document";
import { submitApplication } from "@/actions/applicant/application";

const EMPTY_DOC = { file: null, name: "" };

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

  // Keys aligned to DocumentTypeEnum
  const [step4Data, setStep4Data] = useState<Step4Data>({
    passport: EMPTY_DOC,
    visa: EMPTY_DOC,
    nbi: EMPTY_DOC,
    pension: EMPTY_DOC,
    medical: EMPTY_DOC,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

  // ── Zod validation for steps 1–3 ──────────────────────────────────────────
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
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return fieldErrors;
    }

    return {};
  }, [step1Data, step2Data, selectedService]);

  // ── File validation for step 4 ─────────────────────────────────────────────
  const validateStep4 = useCallback((): Record<string, string> => {
    const fileErrors: Record<string, string> = {};

    const result = step4FormSchema.safeParse(step4Data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          fileErrors[issue.path[0] as string] = issue.message;
        }
      });
    }

    setErrors((prev) => ({ ...prev, ...fileErrors }));
    return fileErrors;
  }, [step4Data]);

  // ── Filter errors per step ─────────────────────────────────────────────────
  const getStepErrors = useCallback(
    (step: number): Record<string, string> => {
      if (!submittedSteps.has(step)) return {};

      const stepFields: Record<number, string[]> = {
        1: ["name", "birthday", "sex", "nationality", "maritalStatus"],
        2: [
          "email", "phoneNumber", "streetAddress", "city", "state",
          "zip", "country", "phAddress", "emergencyName",
          "emergencyRelationship", "emergencyPhone",
        ],
        3: ["serviceType"],
        4: ["passport", "visa", "nbi", "pension", "medical"],
      };

      return Object.fromEntries(
        Object.entries(errors).filter(([key]) =>
          stepFields[step]?.includes(key),
        ),
      );
    },
    [errors, submittedSteps],
  );

  const handleStep1Change = (field: keyof Step1Data, value: string) =>
    setStep1Data((prev) => ({ ...prev, [field]: value }));

  const handleStep2Change = (field: keyof Step2Data, value: string) =>
    setStep2Data((prev) => ({ ...prev, [field]: value }));

  const handleDocUpload = (key: keyof Step4Data, file: File) => {
    setStep4Data((prev) => ({ ...prev, [key]: { file, name: file.name } }));
    // Clear error for this field on upload
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNext = async () => {
    setSubmitError(null);
    setSubmittedSteps((prev) => new Set(prev).add(currentStep));

    let stepErrors: Record<string, string> = {};

    if (currentStep === 4) {
      stepErrors = validateStep4();
    } else {
      const allErrors = validateForm();
      const stepFields: Record<number, string[]> = {
        1: ["name", "birthday", "sex", "nationality", "maritalStatus"],
        2: [
          "email", "phoneNumber", "streetAddress", "city", "state",
          "zip", "country", "phAddress", "emergencyName",
          "emergencyRelationship", "emergencyPhone",
        ],
        3: ["serviceType"],
      };
      stepFields[currentStep]?.forEach((field) => {
        if (allErrors[field]) stepErrors[field] = allErrors[field];
      });
    }

    if (Object.keys(stepErrors).length > 0) return;

    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Final submit — build FormData matching server action expectations
    const fd = new FormData();
    fd.append("fullName", step1Data.name);
    fd.append("dateOfBirth", step1Data.birthday);
    fd.append("gender", step1Data.sex);
    fd.append("nationality", step1Data.nationality);
    fd.append("maritalStatus", step1Data.maritalStatus);
    fd.append("email", step2Data.email);
    fd.append("phoneCode", "");
    fd.append("phone", step2Data.phoneNumber);
    fd.append("street", step2Data.streetAddress);
    fd.append("city", step2Data.city);
    fd.append("state", step2Data.state);
    fd.append("zip", step2Data.zip);
    fd.append("country", step2Data.country);
    fd.append("phAddress", step2Data.phAddress);
    fd.append("ecName", step2Data.emergencyName);
    fd.append("ecRelationship", step2Data.emergencyRelationship);
    fd.append("ecPhone", step2Data.emergencyPhone);
    fd.append("serviceType", selectedService);

    for (const [key, doc] of Object.entries(step4Data)) {
      if (doc.file) {
        fd.append(`doc_${key}_file`, doc.file);
        fd.append(`doc_${key}_name`, doc.name);
        const ext = doc.name.split(".").pop()?.toLowerCase() ?? "";
        fd.append(`doc_${key}_format`, ext);
      }
    }

    const result = await submitApplication(
      { error: null, success: false },
      fd,
    );

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    // Reset form on success
    setCurrentStep(1);
    setStep1Data({ name: "", birthday: "", sex: "", nationality: "", maritalStatus: "" });
    setStep2Data({
      email: "", phoneNumber: "", streetAddress: "", city: "", state: "",
      zip: "", country: "", phAddress: "", emergencyName: "",
      emergencyRelationship: "", emergencyPhone: "",
    });
    setSelectedService("");
    setStep4Data({ passport: EMPTY_DOC, visa: EMPTY_DOC, nbi: EMPTY_DOC, pension: EMPTY_DOC, medical: EMPTY_DOC });
    setErrors({});
    setSubmitError(null);
    setSubmittedSteps(new Set());
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const stepErrors = getStepErrors(currentStep);

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
    isLastStep: currentStep === 4,
    errors: stepErrors,
    submitError,
    hasStepErrors: Object.keys(stepErrors).length > 0,
    isFormValid: Object.keys(errors).length === 0,
  };
}