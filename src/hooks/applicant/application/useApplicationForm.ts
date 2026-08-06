import { useState, useCallback, useEffect, useRef } from "react";
import type { ApplicationFormInput } from "@/schemas/application";
import { applicationFormSchema } from "@/schemas/application";
import type { DocumentType } from "@/schemas/document";
import { step4FormSchema } from "@/schemas/document";
import { submitApplication, getExistingApplication } from "@/actions/applicant/application";
import type { ExistingApplicationData } from "@/actions/applicant/application";
import { getMyConsultation } from "@/actions/applicant/consultation";
import { saveFile, loadFile, clearAllFiles } from "@/lib/file-store";
import type { FamilyMember } from "@/components/applicant/application/Step2";
import type { EducationEntry, EmploymentEntry } from "@/components/applicant/application/Step1";

type Step1Data = {
  last_name: string;
  first_name: string;
  middle_name: string;
  birthday: string;
  place_of_birth: string;
  sex: string;
  religion: string;
  nationality: string;
  marital_status: string;
  height: string;
  weight: string;
  passport_number: string;
  passport_place_of_issue: string;
  passport_date_of_issue: string;
  passport_valid_until: string;
  future_plan: string;
  future_plan_other: string;
  date_of_arrival: string;
  exp_date_tourist_visa: string;
  entry_visa_type: string;
  entry_visa_other: string;
  educations: EducationEntry[];
  employments: EmploymentEntry[];
};
type Step2Data = {
  home_country_address: string;
  ph_primary_address: string;
  ph_secondary_address: string;
  telephone_number: string;
  fax_number: string;
  mobile_number: string;
  email: string;
  father_name: string;
  father_age: string;
  mother_name: string;
  mother_age: string;
  family_members: FamilyMember[];
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

const STEP1_INIT: Step1Data = {
  last_name: "",
  first_name: "",
  middle_name: "",
  birthday: "",
  place_of_birth: "",
  sex: "",
  religion: "",
  nationality: "",
  marital_status: "",
  height: "",
  weight: "",
  passport_number: "",
  passport_place_of_issue: "",
  passport_date_of_issue: "",
  passport_valid_until: "",
  future_plan: "",
  future_plan_other: "",
  date_of_arrival: "",
  exp_date_tourist_visa: "",
  entry_visa_type: "",
  entry_visa_other: "",
  educations: [],
  employments: [],
};

const STEP2_INIT: Step2Data = {
  home_country_address: "",
  ph_primary_address: "",
  ph_secondary_address: "",
  telephone_number: "",
  fax_number: "",
  mobile_number: "",
  email: "",
  father_name: "",
  father_age: "",
  mother_name: "",
  mother_age: "",
  family_members: [],
  emergency_name: "",
  emergency_relationship: "",
  emergency_phone: "",
};

export function useSRRVApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data>(STEP1_INIT);
  const [step2Data, setStep2Data] = useState<Step2Data>(STEP2_INIT);
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [consultationApproved, setConsultationApproved] = useState(false);
  const [hasConsultation, setHasConsultation] = useState(false);
  const [isConsultationLoading, setIsConsultationLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<ExistingApplicationData | null>(null);
  const restored = useRef(false);

  function populateFromExisting(existing: ExistingApplicationData) {
    setStep1Data({
      last_name: existing.applicant_profile?.last_name ?? existing.profile.name.split(" ")[0] ?? "",
      first_name: existing.applicant_profile?.first_name ?? existing.profile.name.split(" ").slice(1).join(" ") ?? "",
      middle_name: existing.applicant_profile?.middle_name ?? "",
      birthday: existing.applicant_profile?.date_of_birth ?? existing.profile.birthday ?? "",
      place_of_birth: existing.applicant_profile?.place_of_birth ?? "",
      sex: existing.applicant_profile?.gender ?? existing.profile.sex ?? "",
      religion: existing.applicant_profile?.religion ?? "",
      nationality: existing.applicant_profile?.nationality ?? existing.profile.nationality ?? "",
      marital_status: existing.applicant_profile?.civil_status ?? existing.profile.marital_status ?? "",
      height: String(existing.applicant_profile?.height ?? ""),
      weight: String(existing.applicant_profile?.weight ?? ""),
      passport_number: existing.passport?.passport_number ?? "",
      passport_place_of_issue: existing.passport?.place_of_issue ?? "",
      passport_date_of_issue: existing.passport?.date_of_issue ?? "",
      passport_valid_until: existing.passport?.expiration ?? "",
      future_plan: existing.application.future_plans ?? "",
      future_plan_other: "",
      date_of_arrival: existing.visa_details?.date_of_arrival ?? "",
      exp_date_tourist_visa: existing.visa_details?.exp_date_tourist_visa ?? "",
      entry_visa_type: existing.visa_details?.entry_visa_type ?? "",
      entry_visa_other: "",
      educations: existing.educations.map((e) => ({
        id: crypto.randomUUID(),
        educ_attainment: e.educ_attainment ?? "",
        school: e.school,
        location: e.location,
        from_date: e.from_date,
        to_date: e.to_date,
      })),
      employments: existing.employments.map((e) => ({
        id: crypto.randomUUID(),
        company_name: e.company_name ?? "",
        job_title: e.job_title ?? "",
        contact_no: e.contact_no ?? "",
        company_address: e.company_address ?? "",
        from_date: e.from_date ?? "",
        to_date: e.to_date ?? "",
      })),
    });
    setStep2Data({
      home_country_address: existing.application.street ?? "",
      ph_primary_address: existing.application.ph_address ?? "",
      ph_secondary_address: existing.application.ph_secondary_address ?? "",
      telephone_number: existing.application.tel_no ?? "",
      fax_number: existing.application.fax_no ?? "",
      mobile_number: existing.application.phone_number ?? "",
      email: existing.profile.email ?? "",
      father_name: existing.family_backgrounds?.father_name ?? "",
      father_age: String(existing.family_backgrounds?.father_age ?? ""),
      mother_name: existing.family_backgrounds?.mother_name ?? "",
      mother_age: String(existing.family_backgrounds?.mother_age ?? ""),
      family_members: existing.dependents.map((d) => ({
        id: crypto.randomUUID(),
        full_name: d.name,
        relationship: d.relationship,
        age: String(d.age),
        passport_no: d.passport_no,
        include: d.is_included,
      })),
      emergency_name: existing.application.emergency_name ?? "",
      emergency_relationship: existing.application.emergency_relationship ?? "",
      emergency_phone: existing.application.emergency_phone ?? "",
    });
    setStep4Data((prev) => {
      const next = { ...prev };
      for (const doc of existing.documents) {
        const key = doc.type as DocumentType;
        if (key in next) {
          next[key] = { file: null, name: doc.name };
        }
      }
      return next;
    });
  }

  // ── Restore persisted state ───────────────────────────────────────────
  useEffect(() => {
    setIsLoadingProfile(true);

    const saved = loadPersistedState();

    getExistingApplication()
      .then((existing) => {
        if (existing) {
          clearPersistedState();
          setExistingApplication(existing);
          if (existing.application.status === "pending" || existing.application.status === "rejected") {
            populateFromExisting(existing);
            setCurrentStep(4);
          } else {
            setCurrentStep(5);
          }
          return;
        }

        if (saved && !restored.current) {
          restored.current = true;
          setCurrentStep(saved.currentStep);
          setStep1Data(saved.step1Data);
          setStep2Data(saved.step2Data);
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

          return;
        }
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  // ── Consultation gate: an accepted consultation is required to apply ──────
  useEffect(() => {
    getMyConsultation()
      .then((consultation) => {
        setHasConsultation(consultation !== null);
        setConsultationApproved(consultation?.status === "accepted");
      })
      .finally(() => setIsConsultationLoading(false));
  }, []);

  useEffect(() => {
    if (isLoadingProfile || isConsultationLoading) return;
    if (!consultationApproved && !existingApplication) {
      clearPersistedState();
    }
  }, [isLoadingProfile, isConsultationLoading, consultationApproved, existingApplication]);

  // ── Persist state to sessionStorage on every change ───────────────────────
  useEffect(() => {
    if (existingApplication || isSubmitting) return;
    const persisted: PersistedState = {
      currentStep,
      step1Data,
      step2Data,
      paymentMethod,
      step4Names: Object.fromEntries(
        Object.entries(step4Data).map(([k, v]) => [k, v.name]),
      ) as Record<DocumentType, string>,
      submittedSteps: Array.from(submittedSteps),
    };
    savePersistedState(persisted);
  }, [currentStep, step1Data, step2Data, paymentMethod, step4Data, submittedSteps, existingApplication, isSubmitting]);

  // ── Zod validation for steps 1–3 ──────────────────────────────────────────
  const validateForm = useCallback((): Record<string, string> => {
    const formData = {
      last_name: step1Data.last_name,
      first_name: step1Data.first_name,
      middle_name: step1Data.middle_name,
      birthday: step1Data.birthday,
      place_of_birth: step1Data.place_of_birth,
      sex: step1Data.sex as "male" | "female" | "",
      religion: step1Data.religion,
      nationality: step1Data.nationality,
      marital_status: step1Data.marital_status,
      height: step1Data.height,
      weight: step1Data.weight,
      passport_number: step1Data.passport_number,
      passport_place_of_issue: step1Data.passport_place_of_issue,
      passport_date_of_issue: step1Data.passport_date_of_issue,
      passport_valid_until: step1Data.passport_valid_until,
      email: step2Data.email,
      mobile_number: step2Data.mobile_number,
      telephone_number: step2Data.telephone_number || null,
      fax_number: step2Data.fax_number || null,
      home_country_address: step2Data.home_country_address,
      ph_primary_address: step2Data.ph_primary_address || null,
      ph_secondary_address: step2Data.ph_secondary_address || null,
      father_name: step2Data.father_name || null,
      father_age: step2Data.father_age || null,
      mother_name: step2Data.mother_name || null,
      mother_age: step2Data.mother_age || null,
      family_members: step2Data.family_members,
      emergency_name: step2Data.emergency_name || null,
      emergency_relationship: step2Data.emergency_relationship || null,
      emergency_phone: step2Data.emergency_phone || null,
      future_plan: step1Data.future_plan,
      future_plan_other: step1Data.future_plan_other,
      entry_visa_type: step1Data.entry_visa_type,
      entry_visa_other: step1Data.entry_visa_other,
      date_of_arrival: step1Data.date_of_arrival,
      exp_date_tourist_visa: step1Data.exp_date_tourist_visa,
      educations: step1Data.educations,
      employments: step1Data.employments,

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
  }, [step1Data, step2Data]);

  // ── File validation for step 4 ─────────────────────────────────────────────
  const validateStep4 = useCallback((): Record<string, string> => {
    const fileErrors: Record<string, string> = {};

    const result = step4FormSchema.safeParse(step4Data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const key = issue.path[0] as string;
          // When editing, skip file-required errors for docs with existing names
          if (existingApplication && step4Data[key as DocumentType]?.name) return;
          fileErrors[key] = issue.message;
        }
      });
    }

    setErrors((prev) => ({ ...prev, ...fileErrors }));
    return fileErrors;
  }, [step4Data, existingApplication]);

  // ── Filter errors per step ─────────────────────────────────────────────────
  const getStepErrors = useCallback(
    (step: number): Record<string, string> => {
      if (!submittedSteps.has(step)) return {};

      const stepFields: Record<number, string[]> = {
        1: ["last_name", "first_name", "middle_name", "birthday", "place_of_birth", "sex", "religion", "nationality", "marital_status", "height", "weight", "passport_number", "passport_place_of_issue", "passport_date_of_issue", "passport_valid_until", "educations", "employments", "future_plan_other", "entry_visa_type", "entry_visa_other", "date_of_arrival", "exp_date_tourist_visa"],
        2: [
          "home_country_address",
          "ph_primary_address",
          "ph_secondary_address",
          "telephone_number",
          "fax_number",
          "mobile_number",
          "email",
          "father_name",
          "father_age",
          "mother_name",
          "mother_age",
          "family_members",
          "emergency_name",
          "emergency_relationship",
          "emergency_phone",
        ],
        3: [
          "passport",
          "photo_2x2",
          "pra_application",
          "medical",
          "police",
          "bicc",
          "bank_cert",
          "proof_payment",
          "proof_pension",
          "proof_relationship",
        ],
      };

      return Object.fromEntries(
        Object.entries(errors).filter(([key]) =>
          stepFields[step]?.includes(key),
        ),
      );
    },
    [errors, submittedSteps],
  );

  const handleStep1Change = <F extends keyof Step1Data>(field: F, value: Step1Data[F]) => {
    setStep1Data((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleStep2Change = (field: keyof Step2Data, value: Step2Data[keyof Step2Data]) => {
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

    if (currentStep === 3) {
      stepErrors = validateStep4();
    } else {
      if (currentStep === 4) {
        const docErrors = validateStep4();
        if (Object.keys(docErrors).length > 0) {
          setCurrentStep(3);
          return;
        }
      }
      const allErrors = validateForm();
      const stepFields: Record<number, string[]> = {
        1: ["last_name", "first_name", "middle_name", "birthday", "place_of_birth", "sex", "religion", "nationality", "marital_status", "height", "weight", "passport_number", "passport_place_of_issue", "passport_date_of_issue", "passport_valid_until", "educations", "employments", "future_plan_other", "entry_visa_type", "entry_visa_other", "date_of_arrival", "exp_date_tourist_visa"],
        2: [
          "home_country_address",
          "ph_primary_address",
          "ph_secondary_address",
          "telephone_number",
          "fax_number",
          "mobile_number",
          "email",
          "father_name",
          "father_age",
          "mother_name",
          "mother_age",
          "family_members",
          "emergency_name",
          "emergency_relationship",
          "emergency_phone",
        ],
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
    fd.append("last_name", step1Data.last_name);
    fd.append("first_name", step1Data.first_name);
    fd.append("middle_name", step1Data.middle_name);
    fd.append("birthday", step1Data.birthday);
    fd.append("place_of_birth", step1Data.place_of_birth);
    fd.append("sex", step1Data.sex);
    fd.append("religion", step1Data.religion);
    fd.append("nationality", step1Data.nationality);
    fd.append("marital_status", step1Data.marital_status);
    fd.append("height", step1Data.height);
    fd.append("weight", step1Data.weight);
    fd.append("passport_number", step1Data.passport_number);
    fd.append("passport_place_of_issue", step1Data.passport_place_of_issue);
    fd.append("passport_date_of_issue", step1Data.passport_date_of_issue);
    fd.append("passport_valid_until", step1Data.passport_valid_until);
    fd.append("home_country_address", step2Data.home_country_address);
    fd.append("ph_primary_address", step2Data.ph_primary_address);
    fd.append("ph_secondary_address", step2Data.ph_secondary_address);
    fd.append("telephone_number", step2Data.telephone_number);
    fd.append("fax_number", step2Data.fax_number);
    fd.append("mobile_number", step2Data.mobile_number);
    fd.append("email", step2Data.email);
    fd.append("father_name", step2Data.father_name);
    fd.append("father_age", step2Data.father_age);
    fd.append("mother_name", step2Data.mother_name);
    fd.append("mother_age", step2Data.mother_age);
    fd.append("emergency_name", step2Data.emergency_name);
    fd.append("emergency_relationship", step2Data.emergency_relationship);
    fd.append("emergency_phone", step2Data.emergency_phone);
    fd.append("payment_method", paymentMethod);
    fd.append("future_plan", step1Data.future_plan);
    fd.append("future_plan_other", step1Data.future_plan_other);
    fd.append("date_of_arrival", step1Data.date_of_arrival);
    fd.append("exp_date_tourist_visa", step1Data.exp_date_tourist_visa);
    fd.append("entry_visa_type", step1Data.entry_visa_type);
    fd.append("entry_visa_other", step1Data.entry_visa_other);

    step2Data.family_members.forEach((member, index) => {
      fd.append(`family_members[${index}].full_name`, member.full_name);
      fd.append(`family_members[${index}].relationship`, member.relationship);
      fd.append(`family_members[${index}].age`, member.age);
      fd.append(`family_members[${index}].passport_no`, member.passport_no);
      fd.append(`family_members[${index}].include`, String(member.include));
    });

    step1Data.educations.forEach((entry, index) => {
      fd.append(`educations[${index}].educ_attainment`, entry.educ_attainment);
      fd.append(`educations[${index}].school`, entry.school);
      fd.append(`educations[${index}].location`, entry.location);
      fd.append(`educations[${index}].from_date`, entry.from_date);
      fd.append(`educations[${index}].to_date`, entry.to_date);
    });

    step1Data.employments.forEach((entry, index) => {
      fd.append(`employments[${index}].company_name`, entry.company_name);
      fd.append(`employments[${index}].job_title`, entry.job_title);
      fd.append(`employments[${index}].contact_no`, entry.contact_no);
      fd.append(`employments[${index}].company_address`, entry.company_address);
      fd.append(`employments[${index}].from_date`, entry.from_date);
      fd.append(`employments[${index}].to_date`, entry.to_date);
    });

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

    if (existingApplication) {
      setShowSuccess(true);
      return;
    }

    // Reset form on success (fallback if no invoiceUrl)
    clearPersistedState();
    clearAllFiles();
    setCurrentStep(1);
    setStep1Data(STEP1_INIT);
    setStep2Data(STEP2_INIT);
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

  const handleEdit = useCallback(() => {
    if (!existingApplication) return;
    populateFromExisting(existingApplication);
    setCurrentStep(4);
  }, [existingApplication]);

  const stepErrors = getStepErrors(currentStep);

  // ── TEST: auto-fill step 1 & 2 fields ────────────────────────────────
  const fillTestData = useCallback(() => {
    const today = new Date();
    const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

    const past = new Date(today);
    past.setFullYear(past.getFullYear() - 5);
    const pastStr = fmtDate(past);

    const eduEnd = new Date(today);
    eduEnd.setFullYear(eduEnd.getFullYear() - 2);
    const eduEndStr = fmtDate(eduEnd);

    const eduStart = new Date(today);
    eduStart.setFullYear(eduStart.getFullYear() - 8);
    const eduStartStr = fmtDate(eduStart);

    const future = new Date(today);
    future.setFullYear(future.getFullYear() + 5);
    const futureStr = fmtDate(future);

    const soon = new Date(today);
    soon.setDate(soon.getDate() + 60);
    const soonStr = fmtDate(soon);

    const empStart = new Date(today);
    empStart.setFullYear(empStart.getFullYear() - 3);
    const empStartStr = fmtDate(empStart);

    const empEnd = new Date(today);
    empEnd.setFullYear(empEnd.getFullYear() - 1);
    const empEndStr = fmtDate(empEnd);

    handleStep1Change("last_name", "Doe");
    handleStep1Change("first_name", "John");
    handleStep1Change("middle_name", "M");
    handleStep1Change("birthday", "1985-03-12");
    handleStep1Change("place_of_birth", "Manila");
    handleStep1Change("sex", "male");
    handleStep1Change("religion", "Catholic");
    handleStep1Change("nationality", "Filipino");
    handleStep1Change("marital_status", "married");
    handleStep1Change("height", "170");
    handleStep1Change("weight", "70");
    handleStep1Change("passport_number", "P12345678");
    handleStep1Change("passport_place_of_issue", "Manila");
    handleStep1Change("passport_date_of_issue", pastStr);
    handleStep1Change("passport_valid_until", futureStr);
    handleStep1Change("future_plan", "tourism");
    handleStep1Change("future_plan_other", "");
    handleStep1Change("date_of_arrival", fmtDate(today));
    handleStep1Change("exp_date_tourist_visa", soonStr);
    handleStep1Change("entry_visa_type", "tourist");
    handleStep1Change("entry_visa_other", "");
    handleStep1Change("educations", [
      {
        id: crypto.randomUUID(),
        educ_attainment: "College",
        school: "University of the Philippines",
        location: "Quezon City",
        from_date: eduStartStr,
        to_date: eduEndStr,
      },
    ]);
    handleStep1Change("employments", [
      {
        id: crypto.randomUUID(),
        company_name: "ABC Corporation",
        job_title: "Senior Manager",
        contact_no: "0287654321",
        company_address: "Makati City",
        from_date: empStartStr,
        to_date: empEndStr,
      },
    ]);

    handleStep2Change("home_country_address", "123 Rizal St, Makati");
    handleStep2Change("ph_primary_address", "Unit 5, Greenfield Tower, Mandaluyong");
    handleStep2Change("ph_secondary_address", "");
    handleStep2Change("telephone_number", "028765432");
    handleStep2Change("fax_number", "028765433");
    handleStep2Change("mobile_number", "09171234567");
    handleStep2Change("email", "john.doe@example.com");
    handleStep2Change("father_name", "Juan Doe");
    handleStep2Change("father_age", "65");
    handleStep2Change("mother_name", "Maria Doe");
    handleStep2Change("mother_age", "60");
    handleStep2Change("emergency_name", "Jane Doe");
    handleStep2Change("emergency_relationship", "Spouse");
    handleStep2Change("emergency_phone", "09189876543");
    handleStep2Change("family_members", [
      {
        id: crypto.randomUUID(),
        full_name: "Jane Doe Jr",
        relationship: "Daughter",
        age: "10",
        passport_no: "CHILD12345",
        include: true,
      },
    ]);
  }, [handleStep1Change, handleStep2Change]);

  return {
    currentStep,
    setCurrentStep,
    step1Data,
    step1Change: handleStep1Change,
    step2Data,
    step2Change: handleStep2Change,
    fillTestData,
    paymentMethod,
    setPaymentMethod,
    step4Data,
    docUpload: handleDocUpload,
    next: handleNext,
    back: handleBack,
    isLastStep: currentStep === 4,
    errors: stepErrors,
    submitError,
    hasStepErrors: Object.keys(stepErrors).length > 0,
    isFormValid: Object.keys(errors).length === 0,
    showConfirm,
    showSuccess,
    confirmSubmit,
    cancelSubmit: () => setShowConfirm(false),
    dismissSuccess: () => {
      setShowSuccess(false);
      clearPersistedState();
      clearAllFiles();
      window.location.href = "/applicant/dashboard";
    },
    isLoadingProfile,
    isConsultationLoading,
    consultationApproved,
    hasConsultation,
    isSubmitting,
    existingApplication,
    startEditing: handleEdit,
  };
}