"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { applicationFormSchema, ServiceTypeEnum } from "@/schemas/application";
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

const DOC_TYPES = ["passport", "visa", "nbi", "pension", "medical"] as const;

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
    service_type: string;
    status: string;
    created_at: string;
    phone_number: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    ph_address: string | null;
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

  return {
    application: {
      id: app.id,
      application_code: app.application_code,
      service_type: app.service_type,
      status: app.status,
      created_at: app.created_at,
      phone_number: app.phone_number,
      street: app.street,
      city: app.city,
      state: app.state,
      zip: app.zip,
      country: app.country,
      ph_address: app.ph_address,
      emergency_name: app.emergency_name,
      emergency_phone: app.emergency_phone,
      emergency_relationship: app.emergency_relationship,
    },
    profile: {
      name: profile?.name ?? "",
      birthday: profile?.birthday ?? "",
      sex: profile?.sex ?? "",
      nationality: profile?.nationality ?? "",
      marital_status: profile?.marital_status ?? "",
      email: user.email ?? "",
    },
    documents: documents ?? [],
    payment,
  };
}

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  // Check if user already has an application
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingApp) {
    return {
      error: "You already have an existing application. Only one application per user is allowed.",
      success: false,
    };
  }

  const serviceType = formData.get("service_type") as string;
  const parsedServiceType = ServiceTypeEnum.safeParse(serviceType);
  if (!parsedServiceType.success) {
    return { error: "Please select a service plan", success: false };
  }

  const formRaw = {
    name: formData.get("name"),
    birthday: formData.get("birthday"),
    sex: formData.get("sex"),
    nationality: formData.get("nationality"),
    marital_status: formData.get("marital_status"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    country: formData.get("country"),
    ph_address: formData.get("ph_address"),
    emergency_name: formData.get("emergency_name"),
    emergency_relationship: formData.get("emergency_relationship"),
    emergency_phone: formData.get("emergency_phone"),
    service_type: serviceType,
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

  const { error: profileError } = await supabase.from("client_profiles").upsert(
    {
      user_id: user.id,
      name: parsed.data.name,
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

  const { data: app, error: appError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      service_type: serviceType as Database["public"]["Enums"]["service_type"],
      application_code: code,
      city: parsed.data.city,
      country: parsed.data.country,
      state: parsed.data.state,
      street: parsed.data.street,
      zip: parsed.data.zip,
      phone_number: parsed.data.phone_number,
      ph_address: parsed.data.ph_address,
      emergency_name: parsed.data.emergency_name,
      emergency_phone: parsed.data.emergency_phone,
      emergency_relationship: parsed.data.emergency_relationship,
    })
    .select("id")
    .single();

  if (appError || !app)
    return {
      error: appError?.message ?? "Failed to create application",
      success: false,
    };

  // ── Upload documents to Supabase Storage & insert DB records ──────────────
  const docErrors: string[] = [];
  const BUCKET = "documents";

  for (const docType of DOC_TYPES) {
    const file = formData.get(`doc_${docType}_file`) as File | null;
    const name = formData.get(`doc_${docType}_name`) as string | null;
    const formatRaw = formData.get(`doc_${docType}_format`) as string | null;

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

    const storagePath = `${user.id}/${app.id}/${docType}/${name}`;

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
      application_id: app.id,
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

  // ── Get price from service_plans ─────────────────────────────────────────
  const { data: plan } = await supabase
    .from("service_plans")
    .select("price")
    .eq("type", serviceType as Database["public"]["Enums"]["service_type"])
    .single();

  if (!plan) {
    return { error: "Service plan not found", success: false };
  }

  // ── Create payment record ────────────────────────────────────────────────
  const externalId = `srrv-${user.id}-${randomUUID().slice(0, 8)}`;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: plan.price,
      status: "pending",
      payment_method: "ewallet",
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
  const { error: linkError } = await supabase
    .from("applications")
    .update({ payment_id: payment.id })
    .eq("id", app.id);

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
        amount: plan.price,
        description: `SRRV ${serviceType} application fee`,
        payerEmail: parsed.data.email,
        successRedirectUrl: `${origin}/applicant/payment/success?id=${externalId}&external_id=${externalId}&status=paid&amount=${plan.price}&currency=PHP`,
        failureRedirectUrl: `${origin}/applicant/payment/failed?id=${externalId}&external_id=${externalId}&status=failed`,
        currency: "PHP",
        metadata: {
          application_id: String(app.id),
          service_type: serviceType,
        },
      },
    });
    invoiceUrl = invoice.invoiceUrl!;
  } catch (xenditError) {
    const message =
      xenditError instanceof Error
        ? xenditError.message
        : "Failed to create payment invoice";
    return { error: message, success: false };
  }

  revalidatePath("/applicant/application");
  return { error: null, success: true, invoiceUrl };
}
