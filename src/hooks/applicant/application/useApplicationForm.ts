import { useState, useCallback } from "react";
import type { ApplicationFormInput, ServiceType } from "@/schemas/application";
import { applicationFormSchema } from "@/schemas/application";
import type { DocumentType } from "@/schemas/document";
import { step4FormSchema } from "@/schemas/document";
import { submitApplication } from "@/actions/applicant/application";

type Step1Data = {
  [K in keyof Pick<
    ApplicationFormInput,
    "name" | "birthday" | "sex" | "nationality" | "marital_status"
  >]: string;
};
type Step2Data = {
  email: string;
  phone_number: string;
  phone_dial_code: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ph_address: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
};
type DocumentFile = { file: File | null; name: string };
type Step4Data = Record<DocumentType, DocumentFile>;

const EMPTY_DOC = { file: null, name: "" };

export function useSRRVApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: "",
    birthday: "",
    sex: "",
    nationality: "",
    marital_status: "",
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    email: "",
    phone_number: "",
    phone_dial_code: "+63",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    ph_address: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
  });

  const [selectedService, setSelectedService] = useState<ServiceType | "">("");

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
      marital_status: step1Data.marital_status,
      email: step2Data.email,
      phone_number: step2Data.phone_dial_code + step2Data.phone_number,
      street: step2Data.street,
      city: step2Data.city,
      state: step2Data.state,
      zip: step2Data.zip,
      country: step2Data.country,
      ph_address: step2Data.ph_address || null,
      emergency_name: step2Data.emergency_name,
      emergency_relationship: step2Data.emergency_relationship,
      emergency_phone: step2Data.emergency_phone,
      service_type: selectedService,
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
        1: ["name", "birthday", "sex", "nationality", "marital_status"],
        2: [
          "email",
          "phone_number",
          "street",
          "city",
          "state",
          "zip",
          "country",
          "ph_address",
          "emergency_name",
          "emergency_relationship",
          "emergency_phone",
        ],
        3: ["service_type"],
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

  const handleStep1Change = (field: keyof Step1Data, value: string) => {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleStep2Change = (field: keyof Step2Data, value: string) => {
    setStep2Data((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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
        1: ["name", "birthday", "sex", "nationality", "marital_status"],
        2: [
          "email",
          "phone_number",
          "street",
          "city",
          "state",
          "zip",
          "country",
          "ph_address",
          "emergency_name",
          "emergency_relationship",
          "emergency_phone",
        ],
        3: ["service_type"],
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
    fd.append("name", step1Data.name);
    fd.append("birthday", step1Data.birthday);
    fd.append("sex", step1Data.sex);
    fd.append("nationality", step1Data.nationality);
    fd.append("marital_status", step1Data.marital_status);
    fd.append("email", step2Data.email);
    fd.append("phone_number", step2Data.phone_dial_code + step2Data.phone_number);
    fd.append("street", step2Data.street);
    fd.append("city", step2Data.city);
    fd.append("state", step2Data.state);
    fd.append("zip", step2Data.zip);
    fd.append("country", step2Data.country);
    fd.append("ph_address", step2Data.ph_address);
    fd.append("emergency_name", step2Data.emergency_name);
    fd.append("emergency_relationship", step2Data.emergency_relationship);
    fd.append("emergency_phone", step2Data.emergency_phone);
    fd.append("service_type", selectedService);

    for (const [key, doc] of Object.entries(step4Data)) {
      if (doc.file) {
        fd.append(`doc_${key}_file`, doc.file);
        fd.append(`doc_${key}_name`, doc.name);
        const ext = doc.name.split(".").pop()?.toLowerCase() ?? "";
        fd.append(`doc_${key}_format`, ext);
      }
    }

    const result = await submitApplication({ error: null, success: false }, fd);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    // Reset form on success
    setCurrentStep(1);
    setStep1Data({
      name: "",
      birthday: "",
      sex: "",
      nationality: "",
      marital_status: "",
    });
    setStep2Data({
      email: "",
      phone_number: "",
      phone_dial_code: "+63",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      ph_address: "",
      emergency_name: "",
      emergency_relationship: "",
      emergency_phone: "",
    });
    setSelectedService("");
    setStep4Data({
      passport: EMPTY_DOC,
      visa: EMPTY_DOC,
      nbi: EMPTY_DOC,
      pension: EMPTY_DOC,
      medical: EMPTY_DOC,
    });
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
