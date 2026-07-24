import { useState, useCallback, useEffect, useRef } from "react";
import type { ApplicationFormInput, ServiceType } from "@/schemas/application";
import { applicationFormSchema } from "@/schemas/application";
import type { DocumentType } from "@/schemas/document";
import { step4FormSchema } from "@/schemas/document";
import { submitApplication, getApplicantProfile, getExistingApplication } from "@/actions/applicant/application";
import type { ExistingApplicationData } from "@/actions/applicant/application";
import { saveFile, loadFile, clearAllFiles } from "@/lib/file-store";

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

type PersistedState = {
  currentStep: number;
  step1Data: Step1Data;
  step2Data: Step2Data;
  selectedService: ServiceType | "";
  paymentMethod: string;
  step4Names: Record<DocumentType, string>;
  submittedSteps: number[];
};

const STORAGE_KEY = "srrv-application-form";

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — silently ignore */ }
}

function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

/** Parse an E.164 phone (e.g. "+639123456789") into dial code + national number. */
function parseAuthPhone(
  phone: string,
): { phone_dial_code: string; phone_number: string } | Record<string, never> {
  if (!phone.startsWith("+")) return {};
  for (let len = 1; len <= 3; len++) {
    const code = phone.slice(0, len + 1);
    const num = phone.slice(len + 1);
    if (num.length >= 4 && /^\d+$/.test(num)) {
      return { phone_dial_code: code, phone_number: num };
    }
  }
  return {};
}

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
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");

  // Keys aligned to DocumentTypeEnum
  const [step4Data, setStep4Data] = useState<Step4Data>({
    passport: EMPTY_DOC,
    photo_2x2: EMPTY_DOC,
    pra_application: EMPTY_DOC,
    medical: EMPTY_DOC,
    police: EMPTY_DOC,
    bicc: EMPTY_DOC,
    bank_cert: EMPTY_DOC,
    proof_payment: EMPTY_DOC,
    proof_pension: EMPTY_DOC,
    proof_relationship: EMPTY_DOC,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [existingApplication, setExistingApplication] = useState<ExistingApplicationData | null>(null);
  const restored = useRef(false);

  // ── Restore persisted state or pre-fill from profile ──────────────────────
  useEffect(() => {
    setIsLoadingProfile(true);

    const saved = loadPersistedState();

    Promise.all([getApplicantProfile(), getExistingApplication()])
      .then(([profile, existing]) => {
        if (existing) {
          clearPersistedState();
          setExistingApplication(existing);
          setCurrentStep(6);
          return;
        }

        if (saved && !restored.current) {
          restored.current = true;
          setCurrentStep(saved.currentStep);
          setStep1Data(saved.step1Data);
          setStep2Data(saved.step2Data);
          setSelectedService(saved.selectedService);
          setPaymentMethod(saved.paymentMethod);
          setSubmittedSteps(new Set(saved.submittedSteps));

          setStep4Data((prev) => {
            const restored_docs = { ...prev };
            for (const [key, name] of Object.entries(saved.step4Names)) {
              restored_docs[key as DocumentType] = { file: null, name };
            }
            return restored_docs;
          });

          // Restore file blobs from IndexedDB
          void Promise.all(
            Object.entries(saved.step4Names).map(async ([key, name]) => {
              if (!name) return;
              const stored = await loadFile(key);
              if (!stored) return;
              const file = new File([stored.data], stored.name, { type: stored.type });
              setStep4Data((prev) => ({ ...prev, [key as DocumentType]: { file, name: stored.name } }));
            }),
          );

          // Merge profile data into empty fields (auto-fill)
          if (profile) {
            setStep1Data((prev) => ({
              name: prev.name || profile.name,
              birthday: prev.birthday || profile.birthday,
              sex: prev.sex || profile.sex,
              nationality: prev.nationality || profile.nationality,
              marital_status: prev.marital_status || profile.marital_status,
            }));
            setStep2Data((prev) => ({
              ...prev,
              email: prev.email || profile.email,
              ...(profile.phone && !prev.phone_number ? parseAuthPhone(profile.phone) : {}),
            }));
          }
          return;
        }

        if (!profile) return;

        setStep1Data({
          name: profile.name,
          birthday: profile.birthday,
          sex: profile.sex,
          nationality: profile.nationality,
          marital_status: profile.marital_status,
        });

        setStep2Data((prev) => ({
          ...prev,
          email: profile.email,
          ...(profile.phone ? parseAuthPhone(profile.phone) : {}),
        }));
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  // ── Persist state to sessionStorage on every change ───────────────────────
  useEffect(() => {
    if (existingApplication || isSubmitting) return;
    const persisted: PersistedState = {
      currentStep,
      step1Data,
      step2Data,
      selectedService,
      paymentMethod,
      step4Names: Object.fromEntries(
        Object.entries(step4Data).map(([k, v]) => [k, v.name]),
      ) as Record<DocumentType, string>,
      submittedSteps: Array.from(submittedSteps),
    };
    savePersistedState(persisted);
  }, [currentStep, step1Data, step2Data, selectedService, paymentMethod, step4Data, submittedSteps, existingApplication, isSubmitting]);

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
        4: ["passport", "photo_2x2", "medical", "police", "bicc", "bank_cert", "proof_payment"],
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
    saveFile(key, file);
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

    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Show confirmation dialog before final submit
    setShowConfirm(true);
    return;
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    setSubmitError(null);

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
    fd.append("payment_method", paymentMethod);

    for (const [key, doc] of Object.entries(step4Data)) {
      if (doc.file) {
        fd.append(`doc_${key}_file`, doc.file);
        fd.append(`doc_${key}_name`, doc.name);
        const ext = doc.name.split(".").pop()?.toLowerCase() ?? "";
        fd.append(`doc_${key}_format`, ext);
      }
    }

    const result = await submitApplication({ error: null, success: false }, fd);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    if (result.invoiceUrl) {
      clearPersistedState();
      clearAllFiles();
      window.location.href = result.invoiceUrl;
      return;
    }

    // Reset form on success (fallback if no invoiceUrl)
    clearPersistedState();
    clearAllFiles();
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
      photo_2x2: EMPTY_DOC,
      pra_application: EMPTY_DOC,
      medical: EMPTY_DOC,
      police: EMPTY_DOC,
      bicc: EMPTY_DOC,
      bank_cert: EMPTY_DOC,
      proof_payment: EMPTY_DOC,
      proof_pension: EMPTY_DOC,
      proof_relationship: EMPTY_DOC,
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
    paymentMethod,
    setPaymentMethod,
    step4Data,
    docUpload: handleDocUpload,
    next: handleNext,
    back: handleBack,
    isLastStep: currentStep === 5,
    errors: stepErrors,
    submitError,
    hasStepErrors: Object.keys(stepErrors).length > 0,
    isFormValid: Object.keys(errors).length === 0,
    showConfirm,
    confirmSubmit,
    cancelSubmit: () => setShowConfirm(false),
    isLoadingProfile,
    isSubmitting,
    existingApplication,
  };
}
