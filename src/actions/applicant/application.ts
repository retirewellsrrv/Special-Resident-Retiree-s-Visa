"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { personalInfoSchema, contactInfoSchema } from "@/schemas/application";
import {
  DocumentTypeEnum,
  DocumentFormatEnum,
  documentInsertSchema,
} from "@/schemas/document";
import type { Database } from "@/types/supabase";

export type SubmitState = { error: string | null; success: boolean };

const DOC_TYPES = ["passport", "visa", "nbi", "pension", "medical"] as const;

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized", success: false };

  const serviceType = formData.get("serviceType") as string;
  if (!serviceType || !["basic", "premium", "vip"].includes(serviceType)) {
    return { error: "Please select a service plan", success: false };
  }

  const personalRaw = {
    fullName: formData.get("fullName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    nationality: formData.get("nationality"),
    maritalStatus: formData.get("maritalStatus"),
  };
  const personalParsed = personalInfoSchema.safeParse(personalRaw);
  if (!personalParsed.success) {
    return {
      error:
        personalParsed.error.issues[0]?.message ?? "Invalid personal details",
      success: false,
    };
  }

  const contactRaw = {
    email: formData.get("email"),
    phoneCode: formData.get("phoneCode"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    country: formData.get("country"),
    phAddress: formData.get("phAddress"),
    emergencyName: formData.get("emergencyName"),
    emergencyRelationship: formData.get("emergencyRelationship"),
    emergencyPhone: formData.get("emergencyPhone"),
  };
  const contactParsed = contactInfoSchema.safeParse(contactRaw);
  if (!contactParsed.success) {
    return {
      error:
        contactParsed.error.issues[0]?.message ?? "Invalid contact details",
      success: false,
    };
  }

  // Generate application code
  const code = `SRRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { error: profileError } = await supabase.from("client_profiles").upsert(
    {
      user_id: user.id,
      name: personalParsed.data.fullName,
      sex: personalParsed.data.gender,
      birthday: personalParsed.data.dateOfBirth,
      nationality: personalParsed.data.nationality,
      age: personalParsed.data.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(personalParsed.data.dateOfBirth).getTime()) /
              (365.25 * 86400000),
          )
        : 0,
      marital_status: personalParsed.data
        .maritalStatus as Database["public"]["Enums"]["marital_status"],
    },
    { onConflict: "user_id" },
  );

  if (profileError) return { error: profileError.message, success: false };

  const { data: servicePlan } = await supabase
    .from("service_plans")
    .select("price")
    .eq("type", serviceType as Database["public"]["Enums"]["service_type"])
    .single();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: servicePlan?.price ?? 0,
      payment_method: "credit card",
      status: "pending",
      transaction_code: code,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment)
    return {
      error: paymentError?.message ?? "Failed to create payment",
      success: false,
    };

  const { data: app, error: appError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      service_type: serviceType as Database["public"]["Enums"]["service_type"],
      application_code: code,
      city: contactParsed.data.city,
      country: contactParsed.data.country,
      state: contactParsed.data.state,
      street: contactParsed.data.street,
      zip: contactParsed.data.zip,
      phone_number: contactParsed.data.phone,
      ph_address: contactParsed.data.phAddress,
      emergency_name: contactParsed.data.emergencyName,
      emergency_phone: contactParsed.data.emergencyPhone,
      emergency_relationship: contactParsed.data.emergencyRelationship,
      payment_id: payment.id,
      status: "processing",
    })
    .select("id")
    .single();

  if (appError || !app)
    return {
      error: appError?.message ?? "Failed to create application",
      success: false,
    };

  // ── Validate and insert documents ──────────────────────────────────────────
  const docErrors: string[] = [];

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

    const path = `pending/${docType}/${app.id}-${name}`;

    const docInsert = {
      application_id: app.id,
      format: formatParsed.data,
      name,
      path,
      status: "processing" as const,
      type: typeParsed.data,
    };

    const docParsed = documentInsertSchema.safeParse(docInsert);
    if (!docParsed.success) {
      docErrors.push(`Invalid document data for ${docType}`);
      continue;
    }

    const { error: docError } = await supabase
      .from("documents")
      .insert(docParsed.data as Database['public']['Tables']['documents']['Insert']);
    if (docError) {
      docErrors.push(`Failed to save ${docType}: ${docError.message}`);
    }
  }

  if (docErrors.length > 0) {
    return { error: docErrors.join("; "), success: false };
  }

  revalidatePath("/applicant/application");
  return { error: null, success: true };
}
