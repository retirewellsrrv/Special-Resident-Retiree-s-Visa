import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "../lib/supabase/server";
import {
  emailHtmlToText,
  sendApplicationStatusEmailToApplicant,
} from "../lib/mailer";

// ─── helpers ────────────────────────────────────────────────────────────────

function buildAdminClientMock() {
  const insert = vi.fn().mockResolvedValue({ data: null, error: null });
  const from = vi.fn(() => ({ insert }));
  vi.mocked(createAdminClient).mockReturnValue({ from } as never);
  return { from, insert };
}

function mockFetchOk() {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function statusEmailPayload(applicantEmail: string) {
  return {
    applicantEmail,
    applicantName: "Jane Doe",
    applicationCode: "SRRV-2026-0001",
    status: "processing" as const,
    updatedAt: "2026-08-13T10:00:00Z",
    message: "Your application is being reviewed.",
  };
}

// ─── emailHtmlToText (R4) ───────────────────────────────────────────────────

describe("emailHtmlToText", () => {
  it("strips tags and preserves cell content on one line", () => {
    const html = `
      <table>
        <tr><td>Status</td><td>Under Review</td></tr>
        <tr><td>Code</td><td>SRRV-2026-0001</td></tr>
      </table>`;
    const text = emailHtmlToText(html);
    expect(text).toContain("Status  Under Review");
    expect(text).toContain("Code  SRRV-2026-0001");
    expect(text).not.toContain("<");
  });

  it("decodes common HTML entities", () => {
    const text = emailHtmlToText("<p>A &amp; B &lt; C &gt; D</p>");
    expect(text).toContain("A & B < C > D");
  });

  it("turns block tags into newlines and collapses blank lines", () => {
    const text = emailHtmlToText("<h1>Hello</h1><p>World</p><br/>Next");
    expect(text).toBe("Hello\nWorld\nNext");
  });
});

// ─── sendEmail guard + audit logging (R5) ───────────────────────────────────

describe("sendEmail recipient guard + audit log", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-resend-key";
    fetchMock = mockFetchOk();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips sending and logs 'skipped' when the recipient is empty", async () => {
    const supabase = buildAdminClientMock();

    await sendApplicationStatusEmailToApplicant(statusEmailPayload(""));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        to_address: "",
        status: "skipped",
        error: "empty recipient",
      }),
    );
  });

  it("sends with both html and text parts, then logs 'sent'", async () => {
    const supabase = buildAdminClientMock();

    await sendApplicationStatusEmailToApplicant(
      statusEmailPayload("applicant@example.com"),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);

    // R4: the Resend payload must include a plain-text alternative.
    expect(body.html).toContain("being processed");
    expect(body.text).toContain("being processed");
    expect(body.text).not.toContain("<table");

    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        to_address: "applicant@example.com",
        status: "sent",
      }),
    );
  });

  it("logs 'failed' after retrying once when Resend returns a 5xx", async () => {
    const supabase = buildAdminClientMock();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "server error",
    } as never);

    await sendApplicationStatusEmailToApplicant(
      statusEmailPayload("applicant@example.com"),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2); // initial + one retry
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        error: expect.stringContaining("500"),
      }),
    );
  });
});
