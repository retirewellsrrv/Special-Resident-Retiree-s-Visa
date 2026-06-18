import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { mapPaymentMethod } from "@/lib/xendit";

const WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  const token = request.headers.get("x-callback-token") ?? request.headers.get("Xendit-Webhook-Token");

  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Legacy webhook: invoice data is at the top level with status + external_id
  // New webhook: wrapped in { event, data }
  const payload = body.data as Record<string, unknown> | undefined ?? body;
  const externalId = (payload.external_id ?? payload.externalId) as string | undefined;
  const status = payload.status as string | undefined;

  if (externalId && status === "PAID") {
    const supabase = createAdminClient();
    const paymentMethod = mapPaymentMethod(
      (payload.payment_method ?? payload.paymentMethod) as string | undefined,
    );
    await supabase
      .from("payments")
      .update({
        status: "success",
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_code", externalId);
  }

  return NextResponse.json({ received: true });
}
