import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { mapPaymentMethod } from "@/lib/xendit";
import { sendConsultationPaymentEmailToAdmin } from "@/lib/mailer";
import type { Database } from "@/types/supabase";

const WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

type PaymentStatus = Database["public"]["Enums"]["payment_status"];

const PAYMENT_STATUS_BY_XENDIT: Record<string, PaymentStatus | null> = {
  PAID: "success",
  EXPIRED: "failed",
  FAILED: "failed",
};

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

  const paymentStatus = status ? PAYMENT_STATUS_BY_XENDIT[status] ?? null : null;

  if (externalId && paymentStatus) {
    const supabase = createAdminClient();
    const paymentMethod = mapPaymentMethod(
      (payload.payment_method ?? payload.paymentMethod) as string | undefined,
    );

    // Only consider payments that are still pending so a late EXPIRED/FAILED
    // event can never downgrade a payment that already succeeded.
    const { data: existing } = await supabase
      .from("payments")
      .select("id, user_id, service_type")
      .eq("transaction_code", externalId)
      .eq("status", "pending")
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ received: true });
    }

    // Dedup guard: never record a second success for the same user + service.
    // If the user already has a successful payment for this service, mark this
    // one failed instead so duplicate paid invoices can't double-count.
    let statusToApply: PaymentStatus = paymentStatus;
    if (paymentStatus === "success") {
      const { data: duplicate } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", existing.user_id)
        .eq("service_type", existing.service_type)
        .eq("status", "success")
        .neq("id", existing.id)
        .maybeSingle();

      if (duplicate) {
        statusToApply = "failed";
      }
    }

    const { data: payment } = await supabase
      .from("payments")
      .update({
        status: statusToApply,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("status", "pending")
      .select("user_id, amount, status, payment_method, transaction_code, service_type")
      .maybeSingle();

    if (payment?.service_type === "consultation" && payment.status === "success") {
      try {
        const [{ data: consultation }, { data: clientProfile }] =
          await Promise.all([
            supabase
              .from("consultations")
              .select("meeting_date, mode_communication, purpose")
              .eq("user_id", payment.user_id)
              .maybeSingle(),
            supabase
              .from("client_profiles")
              .select("name")
              .eq("user_id", payment.user_id)
              .maybeSingle(),
          ]);

        if (consultation) {
          const { data: { user } } =
            await supabase.auth.admin.getUserById(payment.user_id);

          await sendConsultationPaymentEmailToAdmin({
            applicantEmail: user?.email ?? "",
            applicantName: clientProfile?.name ?? "",
            meetingDate: consultation.meeting_date,
            mode: consultation.mode_communication,
            purpose: consultation.purpose,
            payment: {
              amount: payment.amount,
              status: payment.status,
              paymentMethod: payment.payment_method,
              transactionCode: payment.transaction_code,
            },
          });
        }
      } catch (emailError) {
        console.error("sendConsultationPaymentEmailToAdmin error:", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}