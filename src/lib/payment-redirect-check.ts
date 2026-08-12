import { headers } from "next/headers";

const PROBE_TIMEOUT_MS = 4000;

export function resolveAppOrigin(headerOrigin: string | null | undefined): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const header = headerOrigin?.trim();
  const origin = envOrigin || header || "http://localhost:3000";
  return origin.replace(/\/+$/, "");
}

export type RedirectProbe = {
  label: string;
  url: string;
  reachable: boolean;
};

export type RedirectCheckResult = {
  ok: boolean;
  issues: string[];
  checks: RedirectProbe[];
};

async function probeUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return res.status !== 404;
  } catch {
    return false;
  }
}

export async function verifyPaymentRedirects(origin: string): Promise<RedirectCheckResult> {
  const base = origin.replace(/\/+$/, "");

  const targets = [
    { label: "webhook callback", url: `${base}/api/webhooks/xendit` },
    { label: "payment success redirect", url: `${base}/applicant/payment/success` },
    { label: "payment failed redirect", url: `${base}/applicant/payment/failed` },
  ];

  const checks = await Promise.all(
    targets.map(async (t) => {
      const reachable = await probeUrl(t.url);
      return { ...t, reachable };
    }),
  );

  const issues = checks
    .filter((c) => !c.reachable)
    .map((c) => `${c.label} (${c.url})`);

  return { ok: issues.length === 0, issues, checks };
}

export function paymentRedirectErrorMessage(result: RedirectCheckResult): string {
  return `Payment processing is unavailable: ${result.issues.join(", ")}. Please contact support.`;
}

export async function assertPaymentRedirectsReady(): Promise<string | null> {
  const headersList = await headers();
  const origin = resolveAppOrigin(headersList.get("origin"));
  const result = await verifyPaymentRedirects(origin);
  return result.ok ? null : paymentRedirectErrorMessage(result);
}