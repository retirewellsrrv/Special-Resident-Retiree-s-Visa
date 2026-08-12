"use server";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export type DashboardStats = {
  applications: {
    total: number
    pending: number
    processing: number
    approved: number
    rejected: number
    paused: number
  }
  payments: {
    revenue: number
    success: number
    pending: number
    refunded: number
    refundAmt: number
  }
  documents: {
    pendingReview: number
    total: number
  }
  consultations: {
    total: number
    pending: number
    processing: number
    accepted: number
    rejected: number
  }
  users: {
    total: number
  }
  monthlyRevenue: { month: string; revenue: number }[]
  appsByStatus: { label: string; count: number }[]
  recentApplications: {
    id: number
    user_id: string
    applicant_name: string
    application_code: string
    status: string
    created_at: string
  }[]
  pendingDocuments: {
    id: number
    applicant_name: string
    doc_type: string
    created_at: string
  }[]
  recentConsultations: {
    id: number
    applicant_name: string
    purpose: string
    meeting_date: string
    status: string
    created_at: string
  }[]
}

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
  const supabase = createAdminClient();

  // ── All counts use server-side head queries (no row data transferred) ──
  const [
    { count: appTotal },
    { count: appPending },
    { count: appProcessing },
    { count: appApproved },
    { count: appRejected },
    { count: appPaused },
    { count: paySuccess },
    { count: payPending },
    { count: payCancelled },
    { count: docTotal },
    { count: docPending },
    { count: docProcessing },
    { count: usersTotal },
    { count: consTotal },
    { count: consPending },
    { count: consProcessing },
    { count: consAccepted },
    { count: consRejected },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "paused"),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "success"),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("client_profiles").select("*", { count: "exact", head: true }),
    supabase.from("consultations").select("*", { count: "exact", head: true }),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("consultations").select("*", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  // ── Revenue: only fetch amount column, only for successful/cancelled rows ──
  const [paySuccessData, payCancelledData, monthlyPayments, recentApps, pendingDocs, recentCons] =
    await Promise.all([
      supabase.from("payments").select("amount").eq("status", "success"),
      supabase.from("payments").select("amount").eq("status", "cancelled"),
      supabase
        .from("payments")
        .select("amount, created_at")
        .eq("status", "success")
        .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString()),
      supabase
        .from("applications")
        .select(`
          id,
          user_id,
          application_code,
          status,
          created_at,
          client_profiles!applications_user_id_fkey (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("documents")
        .select(`
          id,
          type,
          created_at,
          applications!documents_application_id_fkey (
            client_profiles!applications_user_id_fkey (name)
          )
        `)
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("consultations")
        .select(`
          id,
          purpose,
          meeting_date,
          status,
          created_at,
          client_profiles!consultation_user_id_fkey (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const revenue = (paySuccessData.data ?? []).reduce((a, r) => a + Number(r.amount), 0);
  const refundAmt = (payCancelledData.data ?? []).reduce((a, r) => a + Number(r.amount), 0);

  // ── Monthly revenue (already filtered to last 90 days) ──
  const monthlyRevenueMap = new Map<string, number>();
  for (const p of (monthlyPayments.data ?? []) as { amount: number; created_at: string }[]) {
    const key = p.created_at.slice(0, 7);
    monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) ?? 0) + Number(p.amount));
  }
  const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
    .map(([month, mRev]) => ({ month, revenue: mRev }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ── Recent applications (already limited to 5) ──
  const recentApplications = ((recentApps.data ?? []) as any[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    applicant_name: r.client_profiles?.name ?? "Unknown",
    application_code: r.application_code,
    status: r.status,
    created_at: r.created_at,
  }));

  // ── Pending documents (already limited to 5) ──
  const pendingDocuments = ((pendingDocs.data ?? []) as any[]).map((d) => ({
    id: d.id,
    applicant_name: d.applications?.client_profiles?.name ?? "Unknown",
    doc_type: d.type,
    created_at: d.created_at,
  }));

  // ── Recent consultation requests (already limited to 5) ──
  const recentConsultations = ((recentCons.data ?? []) as any[]).map((c) => ({
    id: c.id,
    applicant_name: c.client_profiles?.name ?? "Unknown",
    purpose: c.purpose,
    meeting_date: c.meeting_date,
    status: c.status,
    created_at: c.created_at,
  }));

  return {
    applications: {
      total: appTotal ?? 0,
      pending: appPending ?? 0,
      processing: appProcessing ?? 0,
      approved: appApproved ?? 0,
      rejected: appRejected ?? 0,
      paused: appPaused ?? 0,
    },
    payments: {
      revenue,
      success: paySuccess ?? 0,
      pending: payPending ?? 0,
      refunded: payCancelled ?? 0,
      refundAmt,
    },
    documents: {
      pendingReview: (docPending ?? 0) + (docProcessing ?? 0),
      total: docTotal ?? 0,
    },
    consultations: {
      total: consTotal ?? 0,
      pending: consPending ?? 0,
      processing: consProcessing ?? 0,
      accepted: consAccepted ?? 0,
      rejected: consRejected ?? 0,
    },
    users: {
      total: usersTotal ?? 0,
    },
    monthlyRevenue,
    appsByStatus: [
      { label: "pending", count: appPending ?? 0 },
      { label: "processing", count: appProcessing ?? 0 },
      { label: "approved", count: appApproved ?? 0 },
      { label: "rejected", count: appRejected ?? 0 },
      { label: "paused", count: appPaused ?? 0 },
    ].filter((s) => s.count > 0),
    recentApplications,
    pendingDocuments,
    recentConsultations,
  };
},
  ["admin-dashboard"],
  { revalidate: 30, tags: ["admin-dashboard"] },
)
