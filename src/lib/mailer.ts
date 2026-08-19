import { createAdminClient } from "@/lib/supabase/server";

const RESEND_API_URL = "https://api.resend.com/emails";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "dev@retirewellsrrv.com";

/**
 * Converts the inline-HTML email bodies to a plain-text alternative
 * (improves deliverability/spam score and readability in text clients).
 * Optimized for this repo's simple table-based templates.
 */
export function emailHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|div|tr|table)>/gi, "\n")
    .replace(/<\/td>/gi, "  ")
    .replace(/<\/th>/gi, "  ")
    .replace(/<td[^>]*>/gi, "")
    .replace(/<th[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Appends a delivery record to the `email_logs` audit table.
 * Best-effort — a logging failure must never break email sending.
 */
async function logEmail(opts: {
  to: string;
  from?: string;
  subject?: string;
  status: "sent" | "failed" | "skipped";
  error?: string | null;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("email_logs" as never).insert({
      to_address: opts.to,
      from_address: opts.from ?? null,
      subject: opts.subject ?? null,
      status: opts.status,
      error: opts.error ?? null,
      created_at: new Date().toISOString(),
    } as never);
  } catch (err) {
    console.error("[mailer] Failed to write email log:", err);
  }
}

export type ConsultationEmailData = {
  applicantEmail: string;
  applicantName: string;
  meetingDate: string;
  mode: string;
  purpose: string;
  isUpdate?: boolean;
};

export type ConsultationPaymentEmailData = ConsultationEmailData & {
  payment: {
    amount: number;
    status: string;
    paymentMethod: string;
    transactionCode: string;
  };
};

export type ApplicationSubmissionEmailData = {
  applicantEmail: string;
  applicantName: string;
  applicationCode: string;
};

export type ApplicationStatusEmailData = {
  applicantEmail: string;
  applicantName: string;
  applicationCode: string;
  status: "paused" | "pending" | "processing" | "approved" | "rejected" | "payment_failed";
};

export type ConsultationStatusEmailData = {
  applicantEmail: string;
  applicantName: string;
  status: "processing" | "accepted" | "rejected" | "pending";
};

const MODE_LABELS: Record<string, string> = {
  zoom_meeting: "Video Call (Zoom)",
  google_meet: "Video Call (Google Meet)",
  whatsApp: "WhatsApp Call",
  phone_call: "Phone Call",
  face_2_face: "Face-to-Face Meeting",
};

function formatDate(date: string): string {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function modeLabel(mode: string): string {
  return MODE_LABELS[mode] ?? mode;
}

async function sendEmail({
  from,
  to,
  replyTo,
  subject,
  html,
}: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[mailer] RESEND_API_KEY is not set. Skipping email.");
    await logEmail({ to, from, subject, status: "skipped", error: "RESEND_API_KEY not set" });
    return;
  }

  if (!to || !to.trim()) {
    console.warn("[mailer] Skipping email with empty recipient.");
    await logEmail({ to, from, subject, status: "skipped", error: "empty recipient" });
    return;
  }

  let lastError: string | null = null;

  // Best-effort with a single retry on transient failures (network errors,
  // 5xx, 429). Never throws — callers must not be blocked by email problems.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          reply_to: replyTo,
          subject,
          html,
          text: emailHtmlToText(html),
        }),
      });

      if (res.ok) {
        await logEmail({ to, from, subject, status: "sent" });
        return;
      }

      const body = await res.text();
      lastError = `status ${res.status}: ${body.slice(0, 500)}`;
      console.error(
        `[mailer] Failed to send email (attempt ${attempt}/2):`,
        res.status,
        body,
      );

      // Non-transient errors won't improve on retry.
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(
        `[mailer] Email request error (attempt ${attempt}/2):`,
        err,
      );
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  await logEmail({ to, from, subject, status: "failed", error: lastError });
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `
  <table role="presentation" class="srrv-info" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
    ${rows
      .map(
        ({ label, value }) => `
    <tr>
      <td class="srrv-info-label" style="padding: 10px 16px; font-size: 13px; color: #6B7280; white-space: nowrap; vertical-align: top;">${label}</td>
      <td class="srrv-info-value" style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #111827; vertical-align: top; word-break: break-word;">${value}</td>
    </tr>`,
      )
      .join("")}
  </table>`;
}

/**
 * Responsive document shell shared by all templates.
 * - Full HTML doc with viewport meta so mobile clients render at phone width.
 * - Embedded <style> with a 600px media query (Gmail app / Apple Mail /
 *   Outlook mobile): stacks the info rows label-over-value and tightens
 *   padding. Desktop clients without media-query support (Outlook Win)
 *   fall back to the fixed table layout, which stays 560px wide with
 *   word-break on the value cells.
 */
function emailShell(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .srrv-body { padding: 24px 12px !important; }
        .srrv-content { padding: 20px !important; }
        .srrv-info,
        .srrv-info tbody,
        .srrv-info tr,
        .srrv-info td { width: 100% !important; display: block !important; box-sizing: border-box !important; }
        .srrv-info td { border: none !important; padding: 6px 14px !important; white-space: normal !important; }
        .srrv-info-label { font-weight: 600 !important; color: #374151 !important; padding-bottom: 0 !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F9FAFB; -webkit-text-size-adjust: 100%; text-size-adjust: 100%;">
    <div class="srrv-body" style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB;">
              <tr>
                <td style="background-color: #8B1A2B; padding: 24px 28px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; line-height: 1.35;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td class="srrv-content" style="padding: 28px;">
                  ${contentHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

function consultationBody(data: ConsultationEmailData): string {
  const label = data.isUpdate ? "Consultation Details Updated" : "New Consultation Request";
  const subtitle = data.isUpdate
    ? "An applicant has updated their consultation request."
    : "An applicant has submitted a new consultation request.";

  return emailShell(
    label,
    `
    <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">${subtitle}</p>
    ${infoTable([
      { label: "Name", value: data.applicantName || "—" },
      { label: "Email", value: data.applicantEmail },
      { label: "Preferred Date", value: formatDate(data.meetingDate) },
      { label: "Mode", value: modeLabel(data.mode) },
      { label: "Purpose", value: data.purpose },
    ])}
    <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
      Sent automatically from the SRRV applicant portal.
    </p>`,
  );
}

function applicationSubmissionBody(data: ApplicationSubmissionEmailData): string {
  return emailShell(
    "New SRRV Application Submitted",
    `
    <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
      An applicant has submitted a new SRRV application. Please review the details below.
    </p>
    ${infoTable([
      { label: "Name", value: data.applicantName || "—" },
      { label: "Email", value: data.applicantEmail },
      { label: "Application Code", value: data.applicationCode },
    ])}
    <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
      Sent automatically from the SRRV applicant portal.
    </p>`,
  );
}

const APPLICATION_STATUS_LABELS: Record<ApplicationStatusEmailData["status"], string> = {
  approved: "Approved",
  rejected: "Rejected",
  processing: "In Processing",
  paused: "Paused",
  payment_failed: "Payment Failed",
  pending: "Pending Review",
};

function applicationStatusMessage(status: ApplicationStatusEmailData["status"]): string {
  switch (status) {
    case "approved":
      return "Congratulations! Your SRRV application has been approved. Our team will contact you with the next steps for the issuance of your SRRV.";
    case "rejected":
      return "Unfortunately, your SRRV application was not approved. Please sign in to the portal to review the notes and update your details to re-submit.";
    case "processing":
      return "Your SRRV application is now being processed by our team.";
    case "paused":
      return "Your SRRV application has been paused. Please sign in to the portal to check for any required updates.";
    case "payment_failed":
      return "Your payment for the SRRV application failed. Please sign in to the portal to try paying again.";
    case "pending":
      return "Your SRRV application is back to pending and will be reviewed shortly.";
  }
}

function applicationStatusBody(data: ApplicationStatusEmailData): string {
  return emailShell(
    "Application Status Update",
    `
    <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
      ${applicationStatusMessage(data.status)}
    </p>
    ${infoTable([
      { label: "Name", value: data.applicantName || "—" },
      { label: "Email", value: data.applicantEmail },
      { label: "Application Code", value: data.applicationCode },
      { label: "Status", value: APPLICATION_STATUS_LABELS[data.status] },
    ])}
    <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
      Sent automatically from the SRRV applicant portal.
    </p>`,
  );
}

const CONSULTATION_STATUS_LABELS: Record<ConsultationStatusEmailData["status"], string> = {
  accepted: "Accepted",
  rejected: "Rejected",
  processing: "In Processing",
  pending: "Pending",
};

function consultationStatusMessage(status: ConsultationStatusEmailData["status"]): string {
  switch (status) {
    case "accepted":
      return "Great news! Your consultation request has been accepted. You can now proceed with submitting your SRRV application.";
    case "rejected":
      return "Your consultation request was not approved. Please contact our team for more details or submit a new request.";
    case "processing":
      return "Your consultation request is now being processed by our team.";
    case "pending":
      return "Your consultation request is now pending review.";
  }
}

function consultationStatusBody(data: ConsultationStatusEmailData): string {
  return emailShell(
    "Consultation Request Update",
    `
    <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
      ${consultationStatusMessage(data.status)}
    </p>
    ${infoTable([
      { label: "Name", value: data.applicantName || "—" },
      { label: "Email", value: data.applicantEmail },
      { label: "Status", value: CONSULTATION_STATUS_LABELS[data.status] },
    ])}
    <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
      Sent automatically from the SRRV applicant portal.
    </p>`,
  );
}

function paymentBody(data: ConsultationPaymentEmailData): string {
  const total = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(data.payment.amount);

  return emailShell(
    "Consultation Fee Paid",
    `
    <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
      An applicant has paid the consultation fee. Please review the details below.
    </p>
    ${infoTable([
      { label: "Name", value: data.applicantName || "—" },
      { label: "Email", value: data.applicantEmail },
      { label: "Preferred Date", value: formatDate(data.meetingDate) },
      { label: "Mode", value: modeLabel(data.mode) },
      { label: "Purpose", value: data.purpose },
      { label: "Amount", value: total },
      { label: "Payment Method", value: data.payment.paymentMethod.replace(/_/g, " ").toUpperCase() },
      { label: "Transaction Code", value: data.payment.transactionCode },
      { label: "Status", value: data.payment.status.toUpperCase() },
    ])}
    <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
      Sent automatically from the SRRV applicant portal.
    </p>`,
  );
}

export async function sendConsultationEmailToAdmin(
  data: ConsultationEmailData,
): Promise<void> {
  await sendEmail({
    from: `Retire Well SRRV <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    replyTo: data.applicantEmail,
    subject: `${data.isUpdate ? "Updated" : "New"} Consultation Request — ${data.applicantName || data.applicantEmail}`,
    html: consultationBody(data),
  });
}

export async function sendConsultationPaymentEmailToAdmin(
  data: ConsultationPaymentEmailData,
): Promise<void> {
  await sendEmail({
    from: `Retire Well SRRV <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    replyTo: data.applicantEmail,
    subject: `Consultation Fee Paid — ${data.applicantName || data.applicantEmail}`,
    html: paymentBody(data),
  });
}

export async function sendApplicationSubmissionEmailToAdmin(
  data: ApplicationSubmissionEmailData,
): Promise<void> {
  await sendEmail({
    from: `Retire Well SRRV <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    replyTo: data.applicantEmail,
    subject: `New SRRV Application — ${data.applicantName || data.applicantEmail}`,
    html: applicationSubmissionBody(data),
  });
}

export async function sendApplicationStatusEmailToApplicant(
  data: ApplicationStatusEmailData,
): Promise<void> {
  await sendEmail({
    from: `Retire Well SRRV <${ADMIN_EMAIL}>`,
    to: data.applicantEmail,
    replyTo: ADMIN_EMAIL,
    subject: `Application ${APPLICATION_STATUS_LABELS[data.status]} — ${data.applicationCode}`,
    html: applicationStatusBody(data),
  });
}

export async function sendConsultationStatusEmailToApplicant(
  data: ConsultationStatusEmailData,
): Promise<void> {
  await sendEmail({
    from: `Retire Well SRRV <${ADMIN_EMAIL}>`,
    to: data.applicantEmail,
    replyTo: ADMIN_EMAIL,
    subject: `Consultation Request ${CONSULTATION_STATUS_LABELS[data.status]}`,
    html: consultationStatusBody(data),
  });
}
