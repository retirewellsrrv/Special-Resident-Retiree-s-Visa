"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { applicationFormSchema } from "@/schemas/application";
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

  const serviceType = formData.get("service_type") as string;
  if (!serviceType || !["basic", "premium", "vip"].includes(serviceType)) {
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
  const storageAdmin = createAdminClient();
  const BUCKET = "documents";

  // Ensure the storage bucket exists with correct config
  const { data: buckets } = await storageAdmin.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === BUCKET);
  if (bucketExists) {
    await storageAdmin.storage.updateBucket(BUCKET, {
      public: false,
      allowedMimeTypes: null,
      fileSizeLimit: 52428800,
    });
  } else {
    const { error: bucketError } = await storageAdmin.storage.createBucket(BUCKET, {
      public: false,
      allowedMimeTypes: null,
      fileSizeLimit: 52428800,
    });
    if (bucketError) {
      return { error: `Failed to create storage bucket: ${bucketError.message}`, success: false };
    }
  }

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

    // Upload file to Supabase Storage
    const storagePath = `${user.id}/${app.id}/${docType}/${name}`;

    const { error: uploadError } = await storageAdmin.storage
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

  revalidatePath("/applicant/application");
  return { error: null, success: true };
}
