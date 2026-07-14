"use server";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type PaymentRow = {
  id: number
  client_name?: string
  amount: number
  status: string
  payment_method: string
  transaction_code: string
  created_at: string
}

export type PaymentStats = {
  revenue: number
  pending: number
  success: number
  refunded: number
  refundAmt: number
  total: number
}

export const getPaymentStats = unstable_cache(
  async (): Promise<PaymentStats> => {
  const supabase = createAdminClient();

  const { data } = await supabase.from("payments").select("status, amount");
  const all = (data ?? []) as { status: string; amount: number }[];
  const completed = all.filter((r) => r.status === "success");
  const refunded = all.filter((r) => r.status === "cancelled");

  return {
    revenue: completed.reduce((a, r) => a + Number(r.amount), 0),
    pending: all.filter((r) => r.status === "pending").length,
    success: completed.length,
    refunded: refunded.length,
    refundAmt: refunded.reduce((a, r) => a + Number(r.amount), 0),
    total: all.length,
  };
},
  ["admin-payments-stats"],
  { revalidate: 30, tags: ["admin-payments"] },
)

function escapeSearch(val: string) {
  return val.replace(/[%_]/g, '\\$&')
}

export async function getPayments({
  page = 1,
  limit = 10,
  status,
  method,
  code,
  name,
  search,
}: {
  page?: number
  limit?: number
  status?: string
  method?: string
  code?: string
  name?: string
  search?: string
} = {}): Promise<{ rows: PaymentRow[]; total: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("payments")
    .select("id, amount, status, payment_method, transaction_code, created_at, user_id", { count: "exact" })

  if (status && status !== "all") {
    query = query.eq("status", status as Database["public"]["Enums"]["payment_status"])
  }
  if (method && method !== "all") {
    query = query.eq("payment_method", method as Database["public"]["Enums"]["payment_methods"])
  }
  if (code) {
    query = query.ilike("transaction_code", `%${escapeSearch(code)}%`)
  }
  if (name) {
    const { data: matchingUsers } = await supabase
      .from("client_profiles")
      .select("user_id")
      .ilike("name", `%${escapeSearch(name)}%`)
    const targetIds = (matchingUsers ?? []).map((u) => u.user_id)
    if (targetIds.length > 0) {
      query = query.in("user_id", targetIds)
    } else {
      query = query.in("user_id", [])
    }
  }
  if (search) {
    const q = escapeSearch(search)
    const { data: matchingUsers } = await supabase
      .from("client_profiles")
      .select("user_id")
      .ilike("name", `%${q}%`)
    const targetIds = (matchingUsers ?? []).map((u) => u.user_id)
    const codeCond = `transaction_code.ilike.%${q}%`
    const methodCond = `payment_method.ilike.%${q}%`
    if (targetIds.length > 0) {
      const userIdConds = targetIds.map((id) => `user_id.eq.${id}`).join(",")
      query = query.or(`${userIdConds},${codeCond},${methodCond}`)
    } else {
      query = query.or(`${codeCond},${methodCond}`)
    }
  }

  query = query.order("created_at", { ascending: false }).range(from, to)

  const { data: allData, count } = await query;

  if (!allData || allData.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  const userIds = [...new Set(allData.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("client_profiles")
    .select("user_id, name")
    .in("user_id", userIds);

  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.name]));

  const rows: PaymentRow[] = allData.map((r) => ({
    id: r.id,
    client_name: nameMap[r.user_id] ?? undefined,
    amount: r.amount,
    status: r.status,
    payment_method: r.payment_method,
    transaction_code: r.transaction_code,
    created_at: r.created_at,
  }));

  return { rows, total: count ?? 0 };
}
