"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { DocumentStatusEnum } from "@/schemas/document";
import { withAdmin } from "@/utils/auth/with-admin";

export const updateDocumentReview = withAdmin(async function updateDocumentReview(
  documentId: number,
  status: string,
  reviewNote?: string | null,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createAdminClient();

  const parsed = DocumentStatusEnum.safeParse(status);
  if (!parsed.success) {
    return { error: "Invalid document status" };
  }

  // Cast needed: review_note migration not yet reflected in generated types
  const { error } = await (supabase
    .from("documents")
    .update({
      status: parsed.data,
      review_note: reviewNote ?? null,
    } as any)
    .eq("id", documentId) as any);

  if (error) return { error: error.message };

  revalidatePath("/admin/applications");
  revalidateTag("admin-applications", 'seconds');
  revalidateTag("admin-dashboard", "seconds");
  return { success: true };
})
