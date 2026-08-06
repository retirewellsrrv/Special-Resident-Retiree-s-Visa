"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { applicationFormSchema } from "@/schemas/application";
import {
  DocumentTypeEnum,
  DocumentFormatEnum,
  documentInsertSchema,
} from "@/schemas/document";
import type { Database } from "@/types/supabase";
import { getUserServer } from "@/utils/auth/getUser";
import xenditClient from "@/lib/xendit";
import { randomUUID } from "crypto";

export type ApplicantProfile = {
  name: string;
  birthday: string;
  sex: string;
  nationality: string;
  marital_status: string;
  email: string;
  phone: string | null;
};

export type SubmitState = {
  error: string | null;
  success: boolean;
  invoiceUrl?: string;
};

const DOC_TYPES = DocumentTypeEnum.options;

export async function getApplicantProfile(): Promise<ApplicantProfile | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("name, birthday, sex, nationality, marital_status")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  return {
    name: profile.name,
    birthday: profile.birthday,
    sex: profile.sex,
    nationality: profile.nationality,
    marital_status: profile.marital_status,
    email: user.email ?? "",
    phone: user.phone ?? null,
  };
}

export type ExistingApplicationData = {
  application: {
    id: number;
    application_code: string;
    status: string;
    created_at: string;
    future_plans: string | null;
    phone_number: string;
    tel_no: string | null;
    fax_no: string | null;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    ph_address: string | null;
    ph_secondary_address: string | null;
    emergency_name: string | null;
    emergency_phone: string | null;
    emergency_relationship: string | null;
  };
  profile: {
    name: string;
    birthday: string;
    sex: string;
    nationality: string;
    marital_status: string;
    email: string;
  };
    applicant_profile: {
    civil_status: string;
    date_of_birth: string;
    gender: string;
    height: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    nationality: string;
    place_of_birth: string;
    religion: string;
    weight: number;
  } | null;
  passport: {
    date_of_issue: string;
    expiration: string;
    passport_number: string;
    place_of_issue: string;
  } | null;
  visa_details: {
    date_of_arrival: string | null;
    entry_visa_type: string | null;
    exp_date_tourist_visa: string | null;
  } | null;
  educations: {
    educ_attainment: string;
    to_date: string;
    location: string;
    school: string;
    from_date: string;
  }[];
  employments: {
    company_address: string | null;
    company_name: string | null;
    contact_no: string | null;
    to_date: string | null;
    is_current: boolean | null;
    job_title: string | null;
    from_date: string | null;
  }[];
  dependents: {
    age: number;
    is_included: boolean;
    name: string;
    passport_no: string;
    relationship: string;
  }[];
  family_backgrounds: {
    father_age: number | null;
    father_name: string;
    mother_age: number | null;
    mother_name: string;
  } | null;
  documents: {
    type: string;
    name: string;
    format: string;
    status: string;
  }[];
  payment: {
    amount: number;
    status: string;
  } | null;
  canRetry: boolean;
};

export async function getExistingApplication(): Promise<ExistingApplicationData | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return null;

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("name, birthday, sex, nationality, marital_status")
    .eq("user_id", user.id)
    .single();

  const { data: documents } = await supabase
    .from("documents")
    .select("type, name, format, status")
    .eq("application_id", app.id);

  const { data: payment } = app.payment_id
    ? await supabase
        .from("payments")
        .select("amount, status")
        .eq("id", app.payment_id)
        .single()
    : { data: null };

  const { data: allPayments } = await supabase
    .from("payments")
    .select("status")
    .eq("user_id", user.id);

  const canRetry =
    allPayments !== null &&
    allPayments.length > 0 &&
    !allPayments.some((p) => p.status === "success");

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  const { data: emergency } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  const { data: applicantProfile } = await supabase
    .from("applicant_profiles")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  const { data: passport } = await supabase
    .from("passports")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  const { data: visa } = await supabase
    .from("visa_details")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  const { data: educations } = await supabase
    .from("educations")
    .select("*")
    .eq("application_id", app.id);

  const { data: employments } = await supabase
    .from("employments")
    .select("*")
    .eq("application_id", app.id);

  const { data: dependents } = await supabase
    .from("dependents")
    .select("*")
    .eq("application_id", app.id);

  const { data: familyBg } = await supabase
    .from("family_backgrounds")
    .select("*")
    .eq("application_id", app.id)
    .maybeSingle();

  return {
    application: {
      id: app.id,
      application_code: app.application_code,
      status: app.status,
      created_at: app.created_at,
      future_plans: app.future_plans,
      phone_number: contact?.mobile_no ?? "",
      tel_no: contact?.tel_no ?? null,
      fax_no: contact?.fax_no ?? null,
      street: contact?.home_country_address ?? "",
      city: "",
      state: "",
      zip: "",
      country: "",
      ph_address: contact?.primary_address_ph ?? null,
      ph_secondary_address: contact?.secondary_address_ph ?? null,
      emergency_name: emergency?.name ?? null,
      emergency_phone: emergency?.phone_no ?? null,
      emergency_relationship: emergency?.relationship ?? null,
    },
    profile: {
      name: profile?.name ?? "",
      birthday: profile?.birthday ?? "",
      sex: profile?.sex ?? "",
      nationality: profile?.nationality ?? "",
      marital_status: profile?.marital_status ?? "",
      email: user.email ?? "",
    },
    applicant_profile: applicantProfile
      ? {
          civil_status: applicantProfile.civil_status,
          date_of_birth: applicantProfile.date_of_birth,
          gender: applicantProfile.gender,
          height: applicantProfile.height,
          first_name: applicantProfile.first_name,
          last_name: applicantProfile.last_name,
          middle_name: applicantProfile.middle_name,
          nationality: applicantProfile.nationality,
          place_of_birth: applicantProfile.place_of_birth,
          religion: applicantProfile.religion,
          weight: applicantProfile.weight,
        }
      : null,
    passport: passport
      ? {
          date_of_issue: passport.date_of_issue,
          expiration: passport.expiration,
          passport_number: passport.passport_number,
          place_of_issue: passport.place_of_issue,
        }
      : null,
    visa_details: visa
      ? {
          date_of_arrival: visa.date_of_arrival,
          entry_visa_type: visa.entry_visa_type,
          exp_date_tourist_visa: visa.exp_date_tourist_visa,
        }
      : null,
    educations: (educations ?? []).map((e) => ({
      educ_attainment: e.educ_attainment,
      to_date: e.to_date,
      location: e.location,
      school: e.school,
      from_date: e.from_date,
    })),
    employments: (employments ?? []).map((e) => ({
      company_address: e.company_address,
      company_name: e.company_name,
      contact_no: e.contact_no,
      to_date: e.to_date,
      is_current: e.is_current,
      job_title: e.job_title,
      from_date: e.from_date,
    })),
    dependents: (dependents ?? []).map((d) => ({
      age: d.age,
      is_included: d.is_included,
      name: d.name,
      passport_no: d.passport_no,
      relationship: d.relationship,
    })),
    family_backgrounds: familyBg
      ? {
          father_age: familyBg.father_age,
          father_name: familyBg.father_name,
          mother_age: familyBg.mother_age,
          mother_name: familyBg.mother_name,
        }
      : null,
    documents: documents ?? [],
    payment,
    canRetry,
  };
}

export type DashboardData = {
  application: {
    application_code: string;
    status: string;
    created_at: string;
  };
  documents: {
    type: string;
    name: string;
    format: string;
    status: string;
    created_at: string;
  }[];
  payment: {
    amount: number;
    status: string;
    payment_method: string;
    transaction_code: string;
  } | null;
  canRetry: boolean;
};

export async function getApplicantDashboard(): Promise<DashboardData | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select("id, application_code, status, created_at, payment_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return null;

  const { data: documents } = await supabase
    .from("documents")
    .select("type, name, format, status, created_at")
    .eq("application_id", app.id)
    .order("created_at");

  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount, status, payment_method, transaction_code, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  let payment: DashboardData["payment"] = null;
  let canRetry = false;

  if (allPayments && allPayments.length > 0) {
    const successPayment = allPayments.find((p) => p.status === "success");
    const displayPayment = successPayment ?? allPayments[0];
    payment = {
      amount: displayPayment.amount,
      status: displayPayment.status,
      payment_method: displayPayment.payment_method,
      transaction_code: displayPayment.transaction_code,
    };
    canRetry = !allPayments.some((p) => p.status === "success");
  }

  return {
    application: {
      application_code: app.application_code,
      status: app.status,
      created_at: app.created_at,
    },
    documents: documents ?? [],
    payment,
    canRetry,
  };
}

export type PaymentReceiptData = {
  transactionCode: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  applicationCode: string;
  clientName: string;
  clientEmail: string;
};

export async function getPaymentReceipt(
  transactionCode: string,
): Promise<PaymentReceiptData | null> {
  const supabase = createAdminClient();

  let { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("*")
    .eq("transaction_code", transactionCode)
    .maybeSingle();

  if (payErr) {
    console.error("getPaymentReceipt: payments query error", payErr);
  }

  if (!payment) {
    const user = await getUserServer();
    if (!user) {
      console.error("getPaymentReceipt: no payment found for", transactionCode);
      return null;
    }
    const { data: fallbackPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!fallbackPayment) {
      console.error("getPaymentReceipt: no payment found for user", user.id);
      return null;
    }
    payment = fallbackPayment;
  }

  let { data: app, error: appErr } = await supabase
    .from("applications")
    .select("application_code, user_id")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (appErr) {
    console.error("getPaymentReceipt: applications query error", appErr);
  }

  if (!app) {
    const { data: fallbackApp } = await supabase
      .from("applications")
      .select("application_code, user_id")
      .eq("user_id", payment.user_id)
      .maybeSingle();
    if (!fallbackApp) {
      console.error("getPaymentReceipt: no application for user_id", payment.user_id);
      return null;
    }
    app = fallbackApp;
  }

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("name")
    .eq("user_id", app.user_id)
    .maybeSingle();

  return {
    transactionCode: payment.transaction_code,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.payment_method,
    createdAt: payment.created_at,
    applicationCode: app.application_code,
    clientName: profile?.name ?? "",
    clientEmail: payment.user_id,
  };
}

export type RetryPaymentState = {
  error: string | null;
  success: boolean;
  invoiceUrl?: string;
};

export async function retryPaymentAction(
  _prev: RetryPaymentState,
  _formData: FormData,
): Promise<RetryPaymentState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return { error: "No application found", success: false };

  const DEFAULT_FEE = 350;

  const { data: existingSuccess } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "success")
    .maybeSingle();

  if (existingSuccess) {
    return { error: "Payment has already been completed", success: false };
  }

  const externalId = `srrv-${user.id}-${randomUUID().slice(0, 8)}`;
  const paymentMethod = "ewallet" as Database["public"]["Enums"]["payment_methods"];

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: DEFAULT_FEE,
      status: "pending",
      payment_method: paymentMethod,
      transaction_code: externalId,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return {
      error: paymentError?.message ?? "Failed to create payment",
      success: false,
    };
  }

  const { error: linkError } = await adminSupabase
    .from("applications")
    .update({ payment_id: payment.id })
    .eq("id", app.id);

  if (linkError) {
    return { error: linkError.message, success: false };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  try {
    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId,
        amount: DEFAULT_FEE,
        description: `SRRV application fee`,
        payerEmail: user.email ?? undefined,
        successRedirectUrl: `${origin}/applicant/payment/success?id=${externalId}&external_id=${externalId}&status=paid&amount=${DEFAULT_FEE}&currency=PHP`,
        failureRedirectUrl: `${origin}/applicant/payment/failed?id=${externalId}&external_id=${externalId}&status=failed`,
        currency: "PHP",
        metadata: {
          application_id: String(app.id),
          service_type: "basic",
          retry: "true",
        },
      },
    });

    revalidatePath("/applicant/dashboard");
    return { error: null, success: true, invoiceUrl: invoice.invoiceUrl! };
  } catch (xenditError) {
    console.error(
      "Xendit retry error:",
      JSON.stringify(xenditError, Object.getOwnPropertyNames(xenditError)),
    );
    const message =
      xenditError instanceof Error
        ? xenditError.message
        : "Failed to create payment invoice";
    return { error: message, success: false };
  }
}

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check if user already has an application
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isEditing = existingApp && (existingApp.status === "pending" || existingApp.status === "rejected");
  const appId = existingApp?.id;

  if (existingApp && !isEditing) {
    return {
      error: "Your application cannot be modified at this stage.",
      success: false,
    };
  }

  const futurePlan = formData.get("future_plan") as string;
  if (!futurePlan) {
    return { error: "Please select a future plan", success: false };
  }

  const paymentMethod = (formData.get("payment_method") as string) || "CREDIT_CARD";

  // Parse family members from form data
  const familyMembers: { full_name: string; relationship: string; age: string; passport_no: string; include: boolean }[] = [];
  let idx = 0;
  while (formData.get(`family_members[${idx}].full_name`)) {
    familyMembers.push({
      full_name: formData.get(`family_members[${idx}].full_name`) as string,
      relationship: (formData.get(`family_members[${idx}].relationship`) as string) ?? "",
      age: (formData.get(`family_members[${idx}].age`) as string) ?? "",
      passport_no: (formData.get(`family_members[${idx}].passport_no`) as string) ?? "",
      include: formData.get(`family_members[${idx}].include`) !== "false",
    });
    idx++;
  }

  const formRaw = {
    last_name: formData.get("last_name"),
    first_name: formData.get("first_name"),
    middle_name: formData.get("middle_name") || "",
    birthday: formData.get("birthday"),
    place_of_birth: formData.get("place_of_birth"),
    sex: formData.get("sex"),
    religion: formData.get("religion"),
    nationality: formData.get("nationality"),
    marital_status: formData.get("marital_status"),
    height: formData.get("height"),
    weight: formData.get("weight"),
    passport_number: formData.get("passport_number"),
    passport_place_of_issue: formData.get("passport_place_of_issue"),
    passport_date_of_issue: formData.get("passport_date_of_issue"),
    passport_valid_until: formData.get("passport_valid_until"),
    email: formData.get("email"),
    mobile_number: formData.get("mobile_number"),
    telephone_number: formData.get("telephone_number") || null,
    fax_number: formData.get("fax_number") || null,
    home_country_address: formData.get("home_country_address"),
    ph_primary_address: formData.get("ph_primary_address") || null,
    ph_secondary_address: formData.get("ph_secondary_address") || null,
    father_name: formData.get("father_name") || null,
    father_age: formData.get("father_age") || null,
    mother_name: formData.get("mother_name") || null,
    mother_age: formData.get("mother_age") || null,
    family_members: familyMembers,
    emergency_name: formData.get("emergency_name") || null,
    emergency_relationship: formData.get("emergency_relationship") || null,
    emergency_phone: formData.get("emergency_phone") || null,
    future_plan: futurePlan,
  };
  const parsed = applicationFormSchema.safeParse(formRaw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
      success: false,
    };
  }

  // Generate application code
  const code = `SRRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const fullName = [parsed.data.last_name, parsed.data.first_name, parsed.data.middle_name]
    .filter(Boolean)
    .join(" ");

  const { error: profileError } = await supabase.from("client_profiles").upsert(
    {
      user_id: user.id,
      name: fullName,
      sex: parsed.data.sex,
      birthday: parsed.data.birthday,
      nationality: parsed.data.nationality,
      age: parsed.data.birthday
        ? Math.floor(
            (Date.now() - new Date(parsed.data.birthday).getTime()) /
              (365.25 * 86400000),
          )
        : 0,
      marital_status: parsed.data
        .marital_status as Database["public"]["Enums"]["marital_status"],
    },
    { onConflict: "user_id" },
  );

  if (profileError) return { error: profileError.message, success: false };

  // Look up the user's consultation to link it to the application
  const { data: consultation } = await supabase
    .from("consultations")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const consultationId = consultation?.id;

  let appIdToUse: number;

  if (isEditing && appId) {
    // Update existing application (use admin client to bypass RLS)
    appIdToUse = appId;
    const { error: appUpdateError } = await adminSupabase
      .from("applications")
      .update({
        future_plans: futurePlan,
        status: "pending",
        ...(consultationId ? { consultation_id: consultationId } : {}),
      } as never)
      .eq("id", appId);

    if (appUpdateError) return { error: appUpdateError.message, success: false };

    // Delete existing child records using admin client (bypass RLS)
    const tables = [
      "contacts", "emergency_contacts", "applicant_profiles", "passports",
      "visa_details", "educations", "employments", "dependents", "family_backgrounds",
    ];
    for (const table of tables) {
      await adminSupabase.from(table as never).delete().eq("application_id", appId);
    }
  } else {
    // Create new application
    const { data: app, error: appError } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        future_plans: futurePlan,
        application_code: code,
        ...(consultationId ? { consultation_id: consultationId } : {}),
      } as never)
      .select("id")
      .single();

    if (appError || !app)
      return {
        error: appError?.message ?? "Failed to create application",
        success: false,
      };
    appIdToUse = app.id;
  }

  // ── Insert contact info ──────────────────────────────────────────────
  const { error: contactError } = await supabase
    .from("contacts")
    .insert({
      application_id: appIdToUse,
      email: parsed.data.email,
      mobile_no: parsed.data.mobile_number,
      tel_no: parsed.data.telephone_number,
      fax_no: parsed.data.fax_number,
      home_country_address: parsed.data.home_country_address,
      primary_address_ph: parsed.data.ph_primary_address,
      secondary_address_ph: parsed.data.ph_secondary_address,
    } as never);

  if (contactError) return { error: contactError.message, success: false };

  // ── Insert emergency contact ─────────────────────────────────────────
  if (parsed.data.emergency_name) {
    const { error: emergencyError } = await supabase
      .from("emergency_contacts")
      .insert({
        application_id: appIdToUse,
        name: parsed.data.emergency_name,
        phone_no: parsed.data.emergency_phone ?? "",
        relationship: parsed.data.emergency_relationship ?? "",
      } as never);

    if (emergencyError) return { error: emergencyError.message, success: false };
  }

  // ── Insert applicant profile ─────────────────────────────────────────
  const { error: appProfileError } = await adminSupabase
    .from("applicant_profiles")
    .insert({
      application_id: appIdToUse,
      civil_status: parsed.data.marital_status as Database["public"]["Enums"]["marital_status"],
      date_of_birth: parsed.data.birthday,
      gender: parsed.data.sex as Database["public"]["Enums"]["sex"],
      height: Number(parsed.data.height) || 0,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      middle_name: parsed.data.middle_name ?? "",
      nationality: parsed.data.nationality,
      place_of_birth: parsed.data.place_of_birth,
      religion: parsed.data.religion,
      weight: Number(parsed.data.weight) || 0,
    } as never);

  if (appProfileError) return { error: appProfileError.message, success: false };

  // ── Insert passport info (if provided) ───────────────────────────────
  const passportNumber = formData.get("passport_number") as string | null;
  if (passportNumber) {
    const { error: passportError } = await supabase
      .from("passports")
      .insert({
        application_id: appIdToUse,
        passport_number: passportNumber,
        date_of_issue: parsed.data.passport_date_of_issue,
        expiration: parsed.data.passport_valid_until,
        place_of_issue: parsed.data.passport_place_of_issue,
      } as never);

    if (passportError) return { error: passportError.message, success: false };
  }

  // ── Insert visa details (if provided) ─────────────────────────────────
  const entryVisaType = formData.get("entry_visa_type") as string | null;
  if (entryVisaType) {
    const { error: visaError } = await supabase
      .from("visa_details")
      .insert({
        application_id: appIdToUse,
        entry_visa_type: entryVisaType,
        date_of_arrival: (formData.get("date_of_arrival") as string) ?? null,
        exp_date_tourist_visa: (formData.get("exp_date_tourist_visa") as string) ?? null,
      } as never);

    if (visaError) return { error: visaError.message, success: false };
  }

  // ── Insert education records (if provided) ────────────────────────────
  let eduIdx = 0;
  while (formData.get(`educations[${eduIdx}].school`)) {
    const { error: eduError } = await supabase
      .from("educations")
      .insert({
        application_id: appIdToUse,
        educ_attainment: (formData.get(`educations[${eduIdx}].educ_attainment`) as string) ?? "",
        school: formData.get(`educations[${eduIdx}].school`) as string,
        location: (formData.get(`educations[${eduIdx}].location`) as string) ?? "",
        from_date: (formData.get(`educations[${eduIdx}].from_date`) as string) ?? "",
        to_date: (formData.get(`educations[${eduIdx}].to_date`) as string) ?? "",
      } as never);

    if (eduError) return { error: eduError.message, success: false };
    eduIdx++;
  }

  // ── Insert employment records (if provided) ───────────────────────────
  let empIdx = 0;
  while (formData.get(`employments[${empIdx}].company_name`)) {
    const { error: empError } = await supabase
      .from("employments")
      .insert({
        application_id: appIdToUse,
        company_name: formData.get(`employments[${empIdx}].company_name`) as string,
        job_title: (formData.get(`employments[${empIdx}].job_title`) as string) ?? null,
        contact_no: (formData.get(`employments[${empIdx}].contact_no`) as string) ?? null,
        company_address: (formData.get(`employments[${empIdx}].company_address`) as string) ?? null,
        from_date: (formData.get(`employments[${empIdx}].from_date`) as string) ?? null,
        to_date: (formData.get(`employments[${empIdx}].to_date`) as string) ?? null,
      } as never);

    if (empError) return { error: empError.message, success: false };
    empIdx++;
  }

  // ── Insert dependents (if provided, Step 2) ────────────────────────────
  for (const member of parsed.data.family_members) {
    if (!member.full_name) continue;
    const { error: depError } = await supabase
      .from("dependents")
      .insert({
        application_id: appIdToUse,
        name: member.full_name,
        age: Number(member.age) || 0,
        passport_no: member.passport_no,
        relationship: member.relationship,
        is_included: member.include,
      } as never);

    if (depError) return { error: depError.message, success: false };
  }

  // ── Insert family background (if provided, Step 2) ─────────────────────
  if (parsed.data.father_name) {
    const { error: famError } = await supabase
      .from("family_backgrounds")
      .insert({
        application_id: appIdToUse,
        father_name: parsed.data.father_name,
        father_age: Number(parsed.data.father_age) || null,
        mother_name: parsed.data.mother_name ?? "",
        mother_age: Number(parsed.data.mother_age) || null,
      } as never);

    if (famError) return { error: famError.message, success: false };
  }

  // ── Upload documents to Supabase Storage & insert DB records ──────────────
  const docErrors: string[] = [];
  const BUCKET = "documents";

  for (const docType of DOC_TYPES) {
    const file = formData.get(`doc_${docType}_file`) as File | null;
    const name = formData.get(`doc_${docType}_name`) as string | null;
    const formatRaw = formData.get(`doc_${docType}_format`) as string | null;

    // When editing, remove existing document of this type before re-uploading
    if (isEditing && file && name) {
      const { data: existingDocs } = await supabase
        .from("documents")
        .select("path")
        .eq("application_id", appIdToUse)
        .eq("type", docType);
      if (existingDocs && existingDocs.length > 0) {
        for (const doc of existingDocs) {
          await supabase.storage.from(BUCKET).remove([doc.path]);
        }
        await supabase.from("documents").delete().eq("application_id", appIdToUse).eq("type", docType);
      }
    }

    if (!file || !name) continue;

    const typeParsed = DocumentTypeEnum.safeParse(docType);
    if (!typeParsed.success) {
      docErrors.push(`Invalid document type: ${docType}`);
      continue;
    }

    const formatParsed = DocumentFormatEnum.safeParse(formatRaw);
    if (!formatParsed.success) {
      docErrors.push(`Invalid file format for ${docType}: ${formatRaw}`);
      continue;
    }

    const storagePath = `${user.id}/${appIdToUse}/${docType}/${name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      docErrors.push(`Failed to upload ${docType}: ${uploadError.message}`);
      continue;
    }

    const docInsert = {
      application_id: appIdToUse,
      format: formatParsed.data,
      name,
      path: storagePath,
      type: typeParsed.data,
    };

    const docParsed = documentInsertSchema.safeParse(docInsert);
    if (!docParsed.success) {
      docErrors.push(`Invalid document data for ${docType}`);
      continue;
    }

    const { error: docError } = await supabase
      .from("documents")
      .insert(
        docParsed.data as Database["public"]["Tables"]["documents"]["Insert"],
      );
    if (docError) {
      docErrors.push(`Failed to save ${docType}: ${docError.message}`);
    }
  }

  if (docErrors.length > 0) {
    return { error: docErrors.join("; "), success: false };
  }

  // If editing, don't create a new payment — keep existing payment
  if (isEditing) {
    revalidatePath("/applicant/application");
    return { error: null, success: true };
  }

  const DEFAULT_FEE = 350;

  // ── Create payment record ────────────────────────────────────────────────
  const externalId = `srrv-${user.id}-${randomUUID().slice(0, 8)}`;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: DEFAULT_FEE,
      status: "pending",
      payment_method: paymentMethod.toLowerCase() as Database["public"]["Enums"]["payment_methods"],
      transaction_code: externalId,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return {
      error: paymentError?.message ?? "Failed to create payment record",
      success: false,
    };
  }

  // ── Link payment to application ──────────────────────────────────────────
  const { error: linkError } = await adminSupabase
    .from("applications")
    .update({ payment_id: payment.id })
    .eq("id", appIdToUse);

  if (linkError) {
    return { error: linkError.message, success: false };
  }

  // ── Create Xendit invoice ────────────────────────────────────────────────
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  let invoiceUrl: string;
  try {
    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId,
        amount: DEFAULT_FEE,
        description: `SRRV application fee`,
        payerEmail: parsed.data.email,
        successRedirectUrl: `${origin}/applicant/payment/success?id=${externalId}&external_id=${externalId}&status=paid&amount=${DEFAULT_FEE}&currency=PHP`,
        failureRedirectUrl: `${origin}/applicant/payment/failed?id=${externalId}&external_id=${externalId}&status=failed`,
        currency: "PHP",
        metadata: {
          application_id: String(appIdToUse),
          service_type: "basic",
        },
      },
    });
    invoiceUrl = invoice.invoiceUrl!;
  } catch (xenditError) {
    console.error("Xendit createInvoice error:", JSON.stringify(xenditError, Object.getOwnPropertyNames(xenditError)));
    const message =
      xenditError instanceof Error
        ? xenditError.message
        : "Failed to create payment invoice";
    return { error: message, success: false };
  }

  revalidatePath("/applicant/application");
  return { error: null, success: true, invoiceUrl };
}
