"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { DocumentStatusEnum } from "@/schemas/document";
import { withAdmin } from "@/utils/auth/with-admin";

export type DocumentForReview = {
  id: number
  application_id: number
  user_id: string
  name: string
  path: string
  type: string
  format: string
  status: string
  review_note: string | null
  created_at: string
  applicant_name: string
  application_code: string
}

export type ReviewStats = {
  total: number
  pending: number
  processing: number
  accepted: number
  rejected: number
}

const PER_PAGE = 20

export async function getDocumentsForReview(opts?: {
  status?: string
  application_id?: number
  userId?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ rows: DocumentForReview[]; total: number; stats: ReviewStats }> {
  const supabase = createAdminClient()
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? PER_PAGE
  const from = (page - 1) * limit
  const to = from + limit - 1

  let targetAppIds: number[] | undefined

  if (opts?.userId) {
    const { data: apps } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", opts.userId)
    targetAppIds = (apps ?? []).map((a) => a.id)
    if (targetAppIds.length === 0) {
      return { rows: [], total: 0, stats: { total: 0, pending: 0, processing: 0, accepted: 0, rejected: 0 } }
    }
  }

  if (opts?.search) {
    const q = opts.search.replace(/[%_]/g, '\\$&')
    const { data: matchingUsers } = await supabase
      .from('client_profiles')
      .select('user_id')
      .ilike('name', `%${q}%`)
    const matchedUserIds = (matchingUsers ?? []).map((u) => u.user_id)
    if (matchedUserIds.length > 0) {
      const { data: apps } = await supabase
        .from("applications")
        .select("id")
        .in("user_id", matchedUserIds)
      const searchAppIds = (apps ?? []).map((a) => a.id)
      targetAppIds = targetAppIds
        ? targetAppIds.filter((id) => searchAppIds.includes(id))
        : searchAppIds
    } else {
      targetAppIds = targetAppIds ?? []
    }
    if (targetAppIds.length === 0) {
      return { rows: [], total: 0, stats: { total: 0, pending: 0, processing: 0, accepted: 0, rejected: 0 } }
    }
  }

  // Query with pagination and count
  let query = supabase
    .from("documents")
    .select(`
      id,
      application_id,
      name,
      path,
      type,
      format,
      status,
      review_note,
      created_at,
      applications!documents_application_id_fkey (
        application_code,
        user_id,
        client_profiles!applications_user_id_fkey (
          name
        )
      )
    `,
    { count: 'exact' },
  )
  .order("created_at", { ascending: false })
  .range(from, to)

  if (targetAppIds) {
    query = query.in("application_id", targetAppIds)
  }
  if (opts?.status) {
    query = query.eq("status", opts.status as any)
  }
  if (opts?.application_id) {
    query = query.eq("application_id", opts.application_id)
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  return formatResults(data ?? [], count ?? 0)
}

export const getDocumentStats = unstable_cache(
  async (): Promise<ReviewStats> => {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from("documents")
      .select("status")

    const all = (data ?? []) as { status: string }[]

    return {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      processing: all.filter((r) => r.status === "processing").length,
      accepted: all.filter((r) => r.status === "accepted").length,
      rejected: all.filter((r) => r.status === "rejected").length,
    }
  },
  ["admin-document-stats"],
  { revalidate: 30, tags: ["admin-documents"] },
)

function formatResults(data: any[], total: number): { rows: DocumentForReview[]; total: number; stats: ReviewStats } {
  const rows: DocumentForReview[] = data.map((d) => ({
    id: d.id,
    application_id: d.application_id,
    user_id: d.applications?.user_id ?? "",
    name: d.name,
    path: d.path,
    type: d.type,
    format: d.format,
    status: d.status,
    review_note: d.review_note ?? null,
    created_at: d.created_at,
    applicant_name: d.applications?.client_profiles?.name ?? "Unknown",
    application_code: d.applications?.application_code ?? "",
  }))

  // Stats are computed from the paginated page for display accuracy
  // (total across all pages comes from the DB count)
  const stats: ReviewStats = {
    total,
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  }

  return { rows, total, stats }
}

export const updateDocumentStatus = withAdmin(async function updateDocumentStatus(
  documentId: number,
  status: string,
  reviewNote?: string | null,
) {
  const supabase = createAdminClient()

  const parsed = DocumentStatusEnum.safeParse(status)
  if (!parsed.success) {
    return { error: "Invalid document status" }
  }

  const { error } = await supabase
    .from("documents")
    .update({ status: parsed.data, review_note: reviewNote ?? null } as any)
    .eq("id", documentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/documents")
  revalidateTag("admin-documents", 'seconds')
  revalidateTag("admin-dashboard", "seconds")
  return { success: true }
})

export const bulkUpdateDocumentStatus = withAdmin(async function bulkUpdateDocumentStatus(
  documentIds: number[],
  status: string,
) {
  const supabase = createAdminClient()

  const parsed = DocumentStatusEnum.safeParse(status)
  if (!parsed.success) {
    return { error: "Invalid document status" }
  }

  const { error } = await supabase
    .from("documents")
    .update({ status: parsed.data })
    .in("id", documentIds)

  if (error) return { error: error.message }

  revalidatePath("/admin/documents")
  revalidateTag("admin-documents", 'seconds')
  revalidateTag("admin-dashboard", "seconds")
  return { success: true }
})

export const getDocumentSignedUrl = withAdmin(async function getDocumentSignedUrl(path: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .storage
    .from("documents")
    .createSignedUrl(path, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
})
