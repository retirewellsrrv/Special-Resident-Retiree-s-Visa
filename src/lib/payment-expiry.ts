import { createAdminClient } from "@/lib/supabase/server";

export const DEFAULT_PAYMENT_EXPIRY_HOURS = 24;

export type ExpirePendingPaymentsResult = {
  expired: number;
  threshold: string;
};

export async function expirePendingPayments(
  client = createAdminClient(),
  opts: { maxAgeHours?: number; now?: Date } = {},
): Promise<ExpirePendingPaymentsResult> {
  const hours = opts.maxAgeHours ?? DEFAULT_PAYMENT_EXPIRY_HOURS;
  const now = opts.now ?? new Date();
  const threshold = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  const { data: stale, error: selectError } = await client
    .from("payments")
    .select("id")
    .eq("status", "pending")
    .lt("created_at", threshold);

  if (selectError) throw new Error(selectError.message);

  if (!stale || stale.length === 0) return { expired: 0, threshold };

  const { error: updateError } = await client
    .from("payments")
    .update({ status: "failed", updated_at: now.toISOString() })
    .in("id", stale.map((r) => r.id))
    .eq("status", "pending");

  if (updateError) throw new Error(updateError.message);

  return { expired: stale.length, threshold };
}
