"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { ConsultationStatusEnum } from "@/schemas/consultation";
import { withAdmin } from "@/utils/auth/with-admin";
import { getUser, requireAdmin } from "@/utils/auth/getUser";
import type { Database } from "@/types/supabase";
import { sendConsultationStatusEmailToApplicant } from "@/lib/mailer";
import type { NotificationType } from "@/lib/notification-types";

/** Throws when the caller is not an admin / super_admin (defense-in-depth). */
async function assertAdmin() {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error(auth.error);
}

export type ConsultationRow = {
  id: number;
  user_id: string;
  applicant_name: string;
  meeting_date: string;
  mode_communication: string;
  purpose: string;
  status: string;
  created_at: string;
  updated_at: string;
  has_application: boolean;
};

export type ConsultationStats = {
  total: number;
  pending: number;
  processing: number;
  accepted: number;
  rejected: number;
};

const PER_PAGE = 10;

export async function getConsultationStats(): Promise<ConsultationStats> {
  await assertAdmin();
  return getCachedConsultationStats();
}

const getCachedConsultationStats = unstable_cache(
  async (): Promise<ConsultationStats> => {
    const supabase = createAdminClient();

    const [
      { count: total },
      { count: pending },
      { count: processing },
      { count: accepted },
      { count: rejected },
    ] = await Promise.all([
      supabase.from("consultations").select("*", { count: "exact", head: true }),
      supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("status", "processing"),
      supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted"),
      supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected"),
    ]);

    return {
      total: total ?? 0,
      pending: pending ?? 0,
      processing: processing ?? 0,
      accepted: accepted ?? 0,
      rejected: rejected ?? 0,
    };
  },
  ["admin-consultation-stats"],
  { revalidate: 30, tags: ["admin-consultations"] },
);

function escapeSearch(val: string) {
  return val.replace(/[%_]/g, "\\$&");
}

export async function getConsultationsForReview({
  page = 1,
  limit = PER_PAGE,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}): Promise<{ rows: ConsultationRow[]; total: number }> {
  await assertAdmin();

  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let targetUserIds: string[] | undefined;

  if (search) {
    const q = escapeSearch(search);
    const { data: matchingUsers } = await supabase
      .from("client_profiles")
      .select("user_id")
      .ilike("name", `%${q}%`);
    targetUserIds = (matchingUsers ?? []).map((u) => u.user_id);

    // Nothing matches the search → short-circuit so the OR filter below is not hit with an empty list
    if (targetUserIds.length === 0) {
      return { rows: [], total: 0 };
    }
  }

  let query = supabase
    .from("consultations")
    .select(
      `
        id,
        user_id,
        meeting_date,
        mode_communication,
        purpose,
        status,
        created_at,
        updated_at,
        client_profiles!consultation_user_id_fkey (
          name
        )
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status as Database["public"]["Enums"]["consultation_status"]);
  }
  if (targetUserIds) {
    query = query.in("user_id", targetUserIds);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  // Determine which consultations already have a linked application (for the queue badge)
  const consultationIds = data.map((c) => c.id);
  const { data: apps } = await supabase
    .from("applications")
    .select("consultation_id")
    .in("consultation_id", consultationIds);
  const linkedIds = new Set((apps ?? []).map((a) => a.consultation_id));

  const rows: ConsultationRow[] = (data as Array<{
    id: number;
    user_id: string;
    meeting_date: string;
    mode_communication: string;
    purpose: string;
    status: string;
    created_at: string;
    updated_at: string;
    client_profiles?: { name: string } | null;
  }>).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    applicant_name: row.client_profiles?.name ?? "Unknown",
    meeting_date: row.meeting_date,
    mode_communication: row.mode_communication,
    purpose: row.purpose,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    has_application: linkedIds.has(row.id),
  }));

  return { rows, total: count ?? 0 };
}

export type ConsultationDetail = {
  id: number;
  user_id: string;
  applicant_name: string;
  email: string;
  meeting_date: string;
  mode_communication: string;
  purpose: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  approved_by_name: string | null;
  application: {
    application_code: string;
    status: string;
    created_at: string;
  } | null;
  payment: {
    amount: number;
    status: string;
    payment_method: string;
    transaction_code: string;
    created_at: string;
  } | null;
};

export async function getConsultationDetail(id: number): Promise<ConsultationDetail | null> {
  await assertAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("consultations")
    .select("id, user_id, meeting_date, mode_communication, purpose, status, created_at, updated_at, approved_by, approved_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const approvedBy = data.approved_by ?? null;

  const [profile, app, payment, adminNameData, superAdminNameData, authUser] = await Promise.all([
    supabase.from("client_profiles").select("name").eq("user_id", data.user_id).maybeSingle(),
    supabase
      .from("applications")
      .select("application_code, status, created_at")
      .eq("consultation_id", data.id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("amount, status, payment_method, transaction_code, created_at")
      .eq("user_id", data.user_id)
      .eq("service_type", "consultation")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("admin_profiles")
      .select("name")
      .eq("user_id", approvedBy ?? "")
      .maybeSingle(),
    supabase
      .from("super_admin_profiles")
      .select("name")
      .eq("user_id", approvedBy ?? "")
      .maybeSingle(),
    supabase.auth.admin.getUserById(data.user_id),
  ]);

  return {
    id: data.id,
    user_id: data.user_id,
    applicant_name: profile.data?.name ?? "Unknown",
    email: authUser.data?.user?.email ?? "",
    meeting_date: data.meeting_date,
    mode_communication: data.mode_communication,
    purpose: data.purpose,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    approved_by: approvedBy,
    approved_at: data.approved_at ?? null,
    approved_by_name: (adminNameData?.data?.name ?? superAdminNameData?.data?.name ?? null) || null,
    application: app.data
      ? {
          application_code: app.data.application_code,
          status: app.data.status,
          created_at: app.data.created_at,
        }
      : null,
    payment: payment.data
      ? {
          amount: payment.data.amount,
          status: payment.data.status,
          payment_method: payment.data.payment_method,
          transaction_code: payment.data.transaction_code,
          created_at: payment.data.created_at,
        }
      : null,
  };
}

export const updateConsultationStatus = withAdmin(async function updateConsultationStatus(
  consultationId: number,
  status: string,
) {
  const supabase = createAdminClient();

  const parsed = ConsultationStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid consultation status", success: false };

  const { data: consultation, error: fetchError } = await supabase
    .from("consultations")
    .select("id, user_id, status")
    .eq("id", consultationId)
    .maybeSingle();

  if (fetchError || !consultation) {
    return { error: "Consultation not found", success: false };
  }

  if (consultation.status === parsed.data) {
    return { error: null, success: true };
  }

  // A consultation can only be processed/accepted once the consultation fee is paid
  if (parsed.data === "processing" || parsed.data === "accepted") {
    const { data: payment } = await supabase
      .from("payments")
      .select("status")
      .eq("user_id", consultation.user_id)
      .eq("service_type", "consultation")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!payment || payment.status !== "success") {
      return {
        error: `Cannot ${
          parsed.data === "accepted" ? "accept" : "set to processing"
        }: the consultation fee has not been paid yet.`,
        success: false,
      };
    }
  }

  // Capture who approved and when. approved_by/approved_at are cleared when the
  // consultation leaves the accepted state so they are only non-null while accepted.
  const user = await getUser();
  const isAccepting = parsed.data === "accepted";
  const { error } = await supabase
    .from("consultations")
    .update({
      status: parsed.data as Database["public"]["Enums"]["consultation_status"],
      updated_at: new Date().toISOString(),
      approved_by: isAccepting ? (user?.id ?? null) : null,
      approved_at: isAccepting ? new Date().toISOString() : null,
    })
    .eq("id", consultationId);

  if (error) return { error: error.message, success: false };

  // Notify the applicant about the status change so their dashboard reflects it
  const label =
    parsed.data === "accepted"
      ? "accepted"
      : parsed.data === "rejected"
        ? "rejected"
        : `updated to ${parsed.data.replace("_", " ")}`;
  await supabase.from("notifications").insert({
    user_id: consultation.user_id,
    notification: `Your consultation request has been ${label}.`,
    is_read: false,
    type: "consultation_status" satisfies NotificationType,
    link: "/applicant/consultation",
    created_at: new Date().toISOString(),
  });

  // Email the applicant so they're informed outside the portal too
  try {
    const [{ data: clientProfile }, { data: { user: applicantUser } }] =
      await Promise.all([
        supabase
          .from("client_profiles")
          .select("name")
          .eq("user_id", consultation.user_id)
          .maybeSingle(),
        supabase.auth.admin.getUserById(consultation.user_id),
      ]);

    await sendConsultationStatusEmailToApplicant({
      applicantEmail: applicantUser?.email ?? "",
      applicantName: clientProfile?.name ?? "",
      status: parsed.data,
    });
  } catch (emailError) {
    console.error("sendConsultationStatusEmailToApplicant error:", emailError);
  }

  revalidatePath("/admin/consultations");
  revalidatePath("/applicant/consultation");
  revalidatePath("/applicant/dashboard");
  revalidateTag("admin-consultations", "seconds");
  return { error: null, success: true };
});