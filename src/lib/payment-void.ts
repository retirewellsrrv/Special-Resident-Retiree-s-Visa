import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { expirePendingInvoices } from "@/lib/xendit";

export async function voidPendingPaymentsBeforeRetry(
  supabase: SupabaseClient<Database>,
  userId: string,
  serviceType: "application" | "consultation",
): Promise<{ voided: number }> {
  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("transaction_code")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("status", "pending");

  const externalIds = (pendingPayments ?? []).map((p) => p.transaction_code);
  if (externalIds.length === 0) return { voided: 0 };

  // Best-effort: expire any live Xendit invoices so a stale invoice can't
  // be paid after a new one is created (prevents double-charge).
  await expirePendingInvoices(externalIds);

  const { error } = await supabase
    .from("payments")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("status", "pending");

  if (error) {
    console.error("voidPendingPaymentsBeforeRetry update error:", error.message);
  }

  return { voided: externalIds.length };
}