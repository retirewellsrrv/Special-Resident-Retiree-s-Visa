"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { DocumentStatusEnum } from "@/schemas/document";

export type DocumentForReview = {
  id: number
  application_id: number
  name: string
  path: string
  type: string
  format: string
  status: string
  created_at: string
  applicant_name: string
  application_code: string
  service_type: string
}

export type ReviewStats = {
  total: number
  pending: number
  processing: number
  accepted: number
  rejected: number
}

export async function getDocumentsForReview(opts?: {
  status?: string
  application_id?: number
  userId?: string
  search?: string
}): Promise<{ rows: DocumentForReview[]; stats: ReviewStats }> {
  const supabase = createAdminClient()

  let targetAppIds: number[] | undefined

  if (opts?.userId) {
    const { data: apps } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", opts.userId)
    targetAppIds = (apps ?? []).map((a) => a.id)
    if (targetAppIds.length === 0) {
      return { rows: [], stats: { total: 0, pending: 0, processing: 0, accepted: 0, rejected: 0 } }
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
      return { rows: [], stats: { total: 0, pending: 0, processing: 0, accepted: 0, rejected: 0 } }
    }
  }

  if (targetAppIds) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        id,
        application_id,
        name,
        path,
        type,
        format,
        status,
        created_at,
        applications!documents_application_id_fkey (
          application_code,
          service_type,
          user_id,
          client_profiles!applications_user_id_fkey (
            name
          )
        )
      `)
      .in("application_id", targetAppIds)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return formatResults(data ?? [])
  }

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
      created_at,
      applications!documents_application_id_fkey (
        application_code,
        service_type,
        user_id,
        client_profiles!applications_user_id_fkey (
          name
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (opts?.status) {
    query = query.eq("status", opts.status as any)
  }
  if (opts?.application_id) {
    query = query.eq("application_id", opts.application_id)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return formatResults(data ?? [])
}

function formatResults(data: any[]): { rows: DocumentForReview[]; stats: ReviewStats } {
  const rows: DocumentForReview[] = data.map((d) => ({
    id: d.id,
    application_id: d.application_id,
    name: d.name,
    path: d.path,
    type: d.type,
    format: d.format,
    status: d.status,
    created_at: d.created_at,
    applicant_name: d.applications?.client_profiles?.name ?? "Unknown",
    application_code: d.applications?.application_code ?? "",
    service_type: d.applications?.service_type ?? "",
  }))

  const stats: ReviewStats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  }

  return { rows, stats }
}

export async function updateDocumentStatus(
  documentId: number,
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
    .eq("id", documentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/documents")
  return { success: true }
}

export async function bulkUpdateDocumentStatus(
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
  return { success: true }
}

export async function getDocumentSignedUrl(path: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .storage
    .from("documents")
    .createSignedUrl(path, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
