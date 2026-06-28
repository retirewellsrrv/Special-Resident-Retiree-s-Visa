"use server";

import { createAdminClient } from "@/lib/supabase/server";

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

export async function getPaymentStats(): Promise<PaymentStats> {
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

  const { data: allData, count } = await supabase
    .from("payments")
    .select("id, amount, status, payment_method, transaction_code, created_at, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!allData || allData.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  const userIds = [...new Set(allData.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("client_profiles")
    .select("user_id, name")
    .in("user_id", userIds);

  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.name]));

  let rows: PaymentRow[] = allData.map((r) => ({
    id: r.id,
    client_name: nameMap[r.user_id] ?? undefined,
    amount: r.amount,
    status: r.status,
    payment_method: r.payment_method,
    transaction_code: r.transaction_code,
    created_at: r.created_at,
  }));

  if (status && status !== "all") {
    rows = rows.filter((r) => r.status === status);
  }
  if (method && method !== "all") {
    rows = rows.filter((r) => r.payment_method === method);
  }
  if (code) {
    rows = rows.filter((r) => r.transaction_code.toLowerCase().includes(code.toLowerCase()));
  }
  if (name) {
    rows = rows.filter((r) => r.client_name?.toLowerCase().includes(name.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.transaction_code.toLowerCase().includes(q) ||
        r.client_name?.toLowerCase().includes(q) ||
        r.payment_method.toLowerCase().includes(q),
    );
  }

  return { rows, total: count ?? 0 };
}
