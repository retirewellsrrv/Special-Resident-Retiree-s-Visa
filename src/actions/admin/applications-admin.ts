"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { ApplicationStatusEnum } from "@/schemas/client-profiles";

export type AppRow = {
    id: number
    client_id: string
    name: string
    application_code: string
    service_type: string
    service_plan_name: string | null
    status: string
    created_at: string
    updated_at: string
}

export type AppStats = {
  total: number;
  paused: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type ActionState = { error: string | null; success: boolean };

export async function getApplicationStats(): Promise<AppStats> {
  const supabase = createAdminClient();

  const [
    { count: total },
    { count: paused },
    { count: pendingCount },
    { count: approved },
    { count: rejected },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "paused"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  return {
    total: total ?? 0,
    paused: paused ?? 0,
    pending: pendingCount ?? 0,
    approved: approved ?? 0,
    rejected: rejected ?? 0,
  };
}

export async function getApplications({
  page = 1,
  limit = 10,
  status,
  userId,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  search?: string;
} = {}): Promise<{ rows: AppRow[]; total: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("applications")
    .select(
      `
            id,
            user_id,
            service_type,
            application_code,
            status,
            created_at,
            updated_at,
            client_profiles!applications_user_id_fkey (
                name
            )
            `,
            { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)

    if (status) query = query.eq('status', status as Database['public']['Enums']['application_status'])
    if (userId) query = query.eq('user_id', userId)

    if (search) {
      const { data: matchingUsers } = await supabase
        .from('client_profiles')
        .select('user_id')
        .ilike('name', `%${search}%`)
      const targetIds = (matchingUsers ?? []).map((u) => u.user_id)
      const appCodeCond = `application_code.ilike.%${search}%`
      if (targetIds.length > 0) {
        const userIdConds = targetIds.map((id) => `user_id.eq.${id}`).join(',')
        query = query.or(`${userIdConds},${appCodeCond}`)
      } else {
        query = query.ilike('application_code', `%${search}%`)
      }
    }

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const serviceTypes = [...new Set((data ?? []).map((r: any) => r.service_type))]
    const { data: plans } = await supabase
        .from('service_plans')
        .select('type, name')
        .in('type', serviceTypes as any[])
    const planNameMap = Object.fromEntries((plans ?? []).map((p) => [p.type, p.name]))

    const rows: AppRow[] = (data ?? []).map((row: any) => ({
        id: row.id,
        client_id: row.user_id,
        name: row.client_profiles?.name ?? 'Unknown',
        application_code: row.application_code,
        service_type: row.service_type,
        service_plan_name: planNameMap[row.service_type] ?? null,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }))

  return { rows, total: count ?? 0 };
}

export type AppDetail = {
  id: number
  user_id: string
  application_code: string
  service_type: string
  service_plan_name: string | null
  service_plan_price: number | null
  status: string
  created_at: string
  updated_at: string
  applicant_name: string
  phone_number: string
  email?: string
  city: string
  state: string
  country: string
  zip: string
  street: string
  ph_address: string | null
  emergency_name: string | null
  emergency_phone: string | null
  emergency_relationship: string | null
  payment: {
    id: number
    amount: number
    status: string
    payment_method: string
    transaction_code: string
    created_at: string
  } | null
  documents: {
    id: number
    name: string
    type: string
    format: string
    status: string
    created_at: string
  }[]
}

export async function getApplicationDetail(id: number): Promise<AppDetail | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      client_profiles!applications_user_id_fkey (
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) return null

  const [docs, plans, paymentData] = await Promise.all([
    supabase
      .from("documents")
      .select("id, name, type, format, status, created_at")
      .eq("application_id", id)
      .order("created_at"),
    supabase
      .from("service_plans")
      .select("name, price")
      .eq("type", data.service_type)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, amount, status, payment_method, transaction_code, created_at")
      .eq("user_id", data.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    id: data.id,
    user_id: data.user_id,
    application_code: data.application_code,
    service_type: data.service_type,
    service_plan_name: plans.data?.name ?? null,
    service_plan_price: plans.data?.price ?? null,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    applicant_name: (data as any).client_profiles?.name ?? "Unknown",
    phone_number: data.phone_number,
    city: data.city,
    state: data.state,
    country: data.country,
    zip: data.zip,
    street: data.street,
    ph_address: data.ph_address,
    emergency_name: data.emergency_name,
    emergency_phone: data.emergency_phone,
    emergency_relationship: data.emergency_relationship,
    payment: paymentData.data
      ? {
          id: paymentData.data.id,
          amount: paymentData.data.amount,
          status: paymentData.data.status,
          payment_method: paymentData.data.payment_method,
          transaction_code: paymentData.data.transaction_code,
          created_at: paymentData.data.created_at,
        }
      : null,
    documents: (docs.data ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      format: d.format,
      status: d.status,
      created_at: d.created_at,
    })),
  }
}

function labelize(s: string) {
  return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function updateAppStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const appId = formData.get("app_id");
  const status = formData.get("status");

  if (!appId || typeof appId !== "string")
    return { error: "Missing application ID", success: false };

  const parsed = ApplicationStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid status value", success: false };

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", Number(appId))
    .single();

  if (fetchError || !app) return { error: "Application not found", success: false };

  const target = parsed.data

  if (target === 'approved') {
    const required = ['phone_number', 'street', 'city', 'state', 'country', 'zip'] as const
    const missing = required.filter((f) => !(app as any)[f])
    if (missing.length > 0) {
      return { error: `Cannot approve: missing required fields (${missing.map(labelize).join(', ')})`, success: false }
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("status")
      .eq("user_id", app.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!payment || payment.status !== 'success') {
      return { error: "Cannot approve: no successful payment found", success: false }
    }

    const { data: docs } = await supabase
      .from("documents")
      .select("status")
      .eq("application_id", app.id)
    const unapproved = (docs ?? []).filter((d) => d.status !== 'accepted')
    if (unapproved.length > 0) {
      return { error: `Cannot approve: ${unapproved.length} document(s) not yet accepted`, success: false }
    }
  }

  if (target === 'processing') {
    const required = ['phone_number', 'street', 'city', 'state', 'country', 'zip'] as const
    const missing = required.filter((f) => !(app as any)[f])
    if (missing.length > 0) {
      return { error: `Cannot set to processing: missing required fields (${missing.map(labelize).join(', ')})`, success: false }
    }
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: target })
    .eq("id", Number(appId));

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/applications");
  return { error: null, success: true };
}
