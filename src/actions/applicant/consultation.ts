"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";
import { consultationFormSchema } from "@/schemas/consultation";
import xenditClient from "@/lib/xendit";
import { assertPaymentRedirectsReady } from "@/lib/payment-redirect-check";
import { sendConsultationEmailToAdmin } from "@/lib/mailer";
import type { Database } from "@/types/supabase";

export type MyConsultation = {
  id: number;
  meeting_date: string;
  mode_communication: Database["public"]["Enums"]["communication_mode"];
  purpose: string;
  status: Database["public"]["Enums"]["consultation_status"];
};

export async function getMyConsultation(): Promise<MyConsultation | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("consultations")
    .select("id, meeting_date, mode_communication, purpose, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export type MyConsultationPayment = {
  amount: number;
  status: Database["public"]["Enums"]["payment_status"];
  payment_method: Database["public"]["Enums"]["payment_methods"];
  transaction_code: string;
};

export async function getMyConsultationPayment(): Promise<MyConsultationPayment | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select("amount, status, payment_method, transaction_code")
    .eq("user_id", user.id)
    .eq("service_type", "consultation")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export type SubmitConsultationState = {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
  invoiceUrl?: string;
};

export async function submitConsultationAction(
  _prev: SubmitConsultationState,
  formData: FormData,
): Promise<SubmitConsultationState> {
  const user = await getUserServer();
  if (!user) {
    return { error: "Unauthorized", fieldErrors: null, success: false };
  }

  const paymentErrorMsg = await assertPaymentRedirectsReady();
  if (paymentErrorMsg) {
    return { error: paymentErrorMsg, fieldErrors: null, success: false };
  }

  const supabase = await createClient();

  const parsed = consultationFormSchema.safeParse({
    meeting_date: formData.get("meeting_date"),
    mode_communication: formData.get("mode_communication"),
    purpose: formData.get("purpose"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
    });
    return { error: null, fieldErrors, success: false };
  }

  // Only one consultation per user: update if it already exists, otherwise insert
  const { data: existing } = await supabase
    .from("consultations")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    existing &&
    (existing.status === "processing" || existing.status === "accepted")
  ) {
    return {
      error:
        "Your consultation is currently being processed and can no longer be modified.",
      fieldErrors: null,
      success: false,
    };
  }

  const values = {
    meeting_date: parsed.data.meeting_date,
    mode_communication: parsed.data.mode_communication,
    purpose: parsed.data.purpose,
  };

  const { data: savedConsultation, error: saveError } = existing
    ? await supabase
        .from("consultations")
        .update(values)
        .eq("id", existing.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("consultations")
        .insert({
          ...values,
          user_id: user.id,
        })
        .select("id")
        .single();

  if (saveError || !savedConsultation) {
    return {
      error: saveError?.message ?? "Failed to save consultation",
      fieldErrors: null,
      success: false,
    };
  }

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();

  try {
    await sendConsultationEmailToAdmin({
      applicantEmail: user.email ?? "",
      applicantName: clientProfile?.name ?? "",
      meetingDate: parsed.data.meeting_date,
      mode: parsed.data.mode_communication,
      purpose: parsed.data.purpose,
      isUpdate: Boolean(existing),
    });
  } catch (emailError) {
    console.error("sendConsultationEmailToAdmin error:", emailError);
  }

  // Ping active admins (in-app) so the request doesn't sit unseen
  try {
    const adminSupabase = createAdminClient();
    const { data: admins } = await adminSupabase
      .from("admin_profiles")
      .select("user_id")
      .eq("is_active", true);

    const applicantName = clientProfile?.name ?? "";
    const applicantLabel = applicantName || user.email || "an applicant";
    const notification = existing
      ? `Consultation request updated by ${applicantLabel}.`
      : `New consultation request submitted by ${applicantLabel}.`;

    if (admins && admins.length > 0) {
      await adminSupabase.from("admin_notifications").insert(
        admins.map((a) => ({
          admin_user_id: a.user_id,
          notification,
          is_read: false,
          type: "new_consultation",
          link: "/admin/consultations",
          created_at: new Date().toISOString(),
        })),
      );
    }
  } catch (notifyError) {
    console.error("Admin consultation notification error:", notifyError);
  }

  revalidatePath("/applicant/consultation");
  revalidatePath("/applicant/dashboard");
  revalidatePath("/admin/consultations");
  revalidateTag("admin-consultations", "seconds");

  // Updates don't create a new payment
  if (existing) {
    redirect("/applicant/dashboard?consultation=success");
  }

  const CONSULTATION_FEE = 50;

  // ── Create consultation payment record ──────────────────────────────────
  const externalId = `srrv-consult-${user.id}-${randomUUID().slice(0, 8)}`;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: CONSULTATION_FEE,
      status: "pending",
      payment_method: "ewallet" as Database["public"]["Enums"]["payment_methods"],
      transaction_code: externalId,
      service_type: "consultation",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return {
      error: paymentError?.message ?? "Failed to create payment record",
      fieldErrors: null,
      success: false,
    };
  }

  const { error: linkError } = await supabase
    .from("consultations")
    .update({ payment_id: payment.id })
    .eq("id", savedConsultation.id);

  if (linkError) {
    return { error: linkError.message, fieldErrors: null, success: false };
  }

  // ── Create Xendit invoice ───────────────────────────────────────────────
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  let invoiceUrl: string;
  try {
    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId,
        amount: CONSULTATION_FEE,
        description: "SRRV consultation fee",
        payerEmail: user.email ?? undefined,
        successRedirectUrl: `${origin}/applicant/payment/success?id=${externalId}&external_id=${externalId}&status=paid&amount=${CONSULTATION_FEE}&currency=PHP`,
        failureRedirectUrl: `${origin}/applicant/payment/failed?id=${externalId}&external_id=${externalId}&status=failed`,
        currency: "PHP",
        metadata: {
          consultation_id: String(savedConsultation.id),
          service_type: "consultation",
        },
      },
    });
    invoiceUrl = invoice.invoiceUrl!;
  } catch (xenditError) {
    console.error(
      "Xendit createInvoice error:",
      JSON.stringify(xenditError, Object.getOwnPropertyNames(xenditError)),
    );
    const message =
      xenditError instanceof Error
        ? xenditError.message
        : "Failed to create payment invoice";
    return { error: message, fieldErrors: null, success: false };
  }

  return { error: null, fieldErrors: null, success: true, invoiceUrl };
}

export type RetryConsultationPaymentState = {
  error: string | null;
  success: boolean;
  invoiceUrl?: string;
};

export async function retryConsultationPaymentAction(
  _prev: RetryConsultationPaymentState,
  _formData: FormData,
): Promise<RetryConsultationPaymentState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const paymentErrorMsg = await assertPaymentRedirectsReady();
  if (paymentErrorMsg) return { error: paymentErrorMsg, success: false };

  const supabase = await createClient();

  const { data: consultation } = await supabase
    .from("consultations")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!consultation) return { error: "No consultation found", success: false };

  const CONSULTATION_FEE = 50;

  const { data: existingSuccess } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("service_type", "consultation")
    .eq("status", "success")
    .maybeSingle();

  if (existingSuccess) {
    return { error: "Payment has already been completed", success: false };
  }

  const externalId = `srrv-consult-${user.id}-${randomUUID().slice(0, 8)}`;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: CONSULTATION_FEE,
      status: "pending",
      payment_method: "ewallet" as Database["public"]["Enums"]["payment_methods"],
      transaction_code: externalId,
      service_type: "consultation",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return {
      error: paymentError?.message ?? "Failed to create payment",
      success: false,
    };
  }

  const { error: linkError } = await supabase
    .from("consultations")
    .update({ payment_id: payment.id })
    .eq("id", consultation.id);

  if (linkError) {
    return { error: linkError.message, success: false };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  try {
    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId,
        amount: CONSULTATION_FEE,
        description: "SRRV consultation fee",
        payerEmail: user.email ?? undefined,
        successRedirectUrl: `${origin}/applicant/payment/success?id=${externalId}&external_id=${externalId}&status=paid&amount=${CONSULTATION_FEE}&currency=PHP`,
        failureRedirectUrl: `${origin}/applicant/payment/failed?id=${externalId}&external_id=${externalId}&status=failed`,
        currency: "PHP",
        metadata: {
          consultation_id: String(consultation.id),
          service_type: "consultation",
          retry: "true",
        },
      },
    });

    revalidatePath("/applicant/consultation");
    revalidatePath("/applicant/dashboard");
    return { error: null, success: true, invoiceUrl: invoice.invoiceUrl! };
  } catch (xenditError) {
    console.error(
      "Xendit createInvoice error:",
      JSON.stringify(xenditError, Object.getOwnPropertyNames(xenditError)),
    );
    const message =
      xenditError instanceof Error
        ? xenditError.message
        : "Failed to create payment invoice";
    return { error: message, success: false };
  }
}
