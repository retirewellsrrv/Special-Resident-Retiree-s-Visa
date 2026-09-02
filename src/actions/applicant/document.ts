"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";
import {
  DocumentTypeEnum,
  DocumentFormatEnum,
} from "@/schemas/document";
import type { Database } from "@/types/supabase";

const MIME_TO_FORMAT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/webp": "webp",
  "image/tiff": "tiff",
  "image/tif": "tif",
};

function detectFormat(file: File): string | null {
  const fromMime = MIME_TO_FORMAT[file.type];
  if (fromMime) return fromMime;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif"].includes(ext)) {
    return ext;
  }
  return null;
}

export type DocumentReuploadState = {
  error: string | null;
  success: boolean;
};

export async function reuploadDocument(
  _prev: DocumentReuploadState,
  formData: FormData,
): Promise<DocumentReuploadState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return { error: "No application found", success: false };

  const docType = formData.get("docType") as string;
  const typeParsed = DocumentTypeEnum.safeParse(docType);
  if (!typeParsed.success) {
    return { error: "Invalid document type", success: false };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please select a file to upload", success: false };
  }

  const format = detectFormat(file);
  const formatParsed = DocumentFormatEnum.safeParse(format);
  if (!formatParsed.success) {
    return { error: "Invalid file format. Accepted: PDF, DOC, DOCX, JPG, PNG, GIF, BMP, WEBP, TIFF.", success: false };
  }

  const BUCKET = "documents";

  const { data: existingDoc } = await supabase
    .from("documents")
    .select("path")
    .eq("application_id", app.id)
    .eq("type", docType as Database["public"]["Tables"]["documents"]["Row"]["type"])
    .maybeSingle();

  if (existingDoc?.path) {
    await supabase.storage.from(BUCKET).remove([existingDoc.path]);
  }

  const storagePath = `${user.id}/${app.id}/${docType}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}`, success: false };
  }

  const { error: docError } = await supabase
    .from("documents")
    .update({
      path: storagePath,
      name: file.name,
      format: formatParsed.data,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("application_id", app.id)
    .eq("type", docType as Database["public"]["Tables"]["documents"]["Row"]["type"]);

  if (docError) {
    return { error: `Failed to update document: ${docError.message}`, success: false };
  }

  revalidatePath("/applicant/dashboard");
  revalidateTag("admin-dashboard", "seconds");
  return { error: null, success: true };
}
