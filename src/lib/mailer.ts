const RESEND_API_URL = "https://api.resend.com/emails";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin.retirewellsrrv@gmail.com";

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
    return;
  }

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
        }),
      });

      if (res.ok) return;

      const body = await res.text();
      console.error(
        `[mailer] Failed to send email (attempt ${attempt}/2):`,
        res.status,
        body,
      );

      // Non-transient errors won't improve on retry.
      if (res.status < 500 && res.status !== 429) return;
    } catch (err) {
      console.error(
        `[mailer] Email request error (attempt ${attempt}/2):`,
        err,
      );
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

function wrapTableRows(rows: { label: string; value: string }[]): string {
  return rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding: 10px 16px; font-size: 13px; color: #6B7280; white-space: nowrap;">${label}</td>
          <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #111827;">${value}</td>
        </tr>`,
    )
    .join("");
}

function consultationBody(data: ConsultationEmailData): string {
  const label = data.isUpdate ? "Consultation Details Updated" : "New Consultation Request";
  const subtitle = data.isUpdate
    ? "An applicant has updated their consultation request."
    : "An applicant has submitted a new consultation request.";

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #8B1A2B; padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">${label}</h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">${subtitle}</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
          ${wrapTableRows([
            { label: "Name", value: data.applicantName || "—" },
            { label: "Email", value: data.applicantEmail },
            { label: "Preferred Date", value: formatDate(data.meetingDate) },
            { label: "Mode", value: modeLabel(data.mode) },
            { label: "Purpose", value: data.purpose },
          ])}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
          Sent automatically from the SRRV applicant portal.
        </p>
      </div>
    </div>
  </div>`;
}

function applicationSubmissionBody(data: ApplicationSubmissionEmailData): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #8B1A2B; padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">New SRRV Application Submitted</h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
          An applicant has submitted a new SRRV application. Please review the details below.
        </p>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
          ${wrapTableRows([
            { label: "Name", value: data.applicantName || "—" },
            { label: "Email", value: data.applicantEmail },
            { label: "Application Code", value: data.applicationCode },
          ])}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
          Sent automatically from the SRRV applicant portal.
        </p>
      </div>
    </div>
  </div>`;
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
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #8B1A2B; padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Application Status Update</h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
          ${applicationStatusMessage(data.status)}
        </p>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
          ${wrapTableRows([
            { label: "Name", value: data.applicantName || "—" },
            { label: "Email", value: data.applicantEmail },
            { label: "Application Code", value: data.applicationCode },
            { label: "Status", value: APPLICATION_STATUS_LABELS[data.status] },
          ])}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
          Sent automatically from the SRRV applicant portal.
        </p>
      </div>
    </div>
  </div>`;
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
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #8B1A2B; padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Consultation Request Update</h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
          ${consultationStatusMessage(data.status)}
        </p>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
          ${wrapTableRows([
            { label: "Name", value: data.applicantName || "—" },
            { label: "Email", value: data.applicantEmail },
            { label: "Status", value: CONSULTATION_STATUS_LABELS[data.status] },
          ])}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
          Sent automatically from the SRRV applicant portal.
        </p>
      </div>
    </div>
  </div>`;
}

function paymentBody(data: ConsultationPaymentEmailData): string {
  const total = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(data.payment.amount);

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #8B1A2B; padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Consultation Fee Paid</h1>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.6;">
          An applicant has paid the consultation fee. Please review the details below.
        </p>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px;">
          ${wrapTableRows([
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
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
          Sent automatically from the SRRV applicant portal.
        </p>
      </div>
    </div>
  </div>`;
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
