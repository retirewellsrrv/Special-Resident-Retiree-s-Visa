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
  users: {
    total: number
  }
  monthlyRevenue: { month: string; revenue: number }[]
  appsByService: { label: string; count: number }[]
  appsByStatus: { label: string; count: number }[]
  recentApplications: {
    id: number
    user_id: string
    applicant_name: string
    application_code: string
    service_type: string
    status: string
    created_at: string
  }[]
  pendingDocuments: {
    id: number
    applicant_name: string
    doc_type: string
    created_at: string
  }[]
}

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
  const supabase = createAdminClient();

  const [
    appCounts,
    paymentData,
    docData,
    userCount,
    monthlyPayments,
    serviceApps,
    statusApps,
    recentApps,
    pendingDocs,
  ] = await Promise.all([
    supabase.from("applications").select("status"),
    supabase.from("payments").select("status, amount"),
    supabase.from("documents").select("status"),
    supabase.from("client_profiles").select("user_id", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("amount, created_at")
      .eq("status", "success")
      .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString()),
    supabase.from("applications").select("service_type"),
    supabase.from("applications").select("status"),
    supabase
      .from("applications")
      .select(`
        id,
        user_id,
        application_code,
        service_type,
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
  ]);

  const allApps = (appCounts.data ?? []) as { status: string }[];
  const allPayments = (paymentData.data ?? []) as { status: string; amount: number }[];
  const allDocs = (docData.data ?? []) as { status: string }[];

  const completed = allPayments.filter((r) => r.status === "success");
  const refunded = allPayments.filter((r) => r.status === "cancelled");

  const byService = (serviceApps.data ?? []) as Record<string, string>[];
  const appsByService = aggregateCount(byService, "service_type");

  const byStatus = (statusApps.data ?? []) as Record<string, string>[];
  const appsByStatus = aggregateCount(byStatus, "status");

  const monthlyRevenueMap = new Map<string, number>();
  for (const p of (monthlyPayments.data ?? []) as { amount: number; created_at: string }[]) {
    const key = p.created_at.slice(0, 7);
    monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) ?? 0) + Number(p.amount));
  }
  const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const recentApplications = ((recentApps.data ?? []) as any[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    applicant_name: r.client_profiles?.name ?? "Unknown",
    application_code: r.application_code,
    service_type: r.service_type,
    status: r.status,
    created_at: r.created_at,
  }));

  const pendingDocuments = ((pendingDocs.data ?? []) as any[]).map((d) => ({
    id: d.id,
    applicant_name: d.applications?.client_profiles?.name ?? "Unknown",
    doc_type: d.type,
    created_at: d.created_at,
  }));

  return {
    applications: {
      total: allApps.length,
      pending: allApps.filter((r) => r.status === "pending").length,
      processing: allApps.filter((r) => r.status === "processing").length,
      approved: allApps.filter((r) => r.status === "approved").length,
      rejected: allApps.filter((r) => r.status === "rejected").length,
      paused: allApps.filter((r) => r.status === "paused").length,
    },
    payments: {
      revenue: completed.reduce((a, r) => a + Number(r.amount), 0),
      success: completed.length,
      pending: allPayments.filter((r) => r.status === "pending").length,
      refunded: refunded.length,
      refundAmt: refunded.reduce((a, r) => a + Number(r.amount), 0),
    },
    documents: {
      pendingReview: allDocs.filter((d) => d.status === "pending" || d.status === "processing").length,
      total: allDocs.length,
    },
    users: {
      total: userCount.count ?? 0,
    },
    monthlyRevenue,
    appsByService,
    appsByStatus,
    recentApplications,
    pendingDocuments,
  };
},
  ["admin-dashboard"],
  { revalidate: 30, tags: ["admin-dashboard"] },
)

function aggregateCount(data: Record<string, string>[], key: string): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of data) {
    const val = item[key] ?? "unknown";
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
