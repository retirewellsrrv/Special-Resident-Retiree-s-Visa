import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.XENDIT_WEBHOOK_TOKEN = "secret";
});

import { POST } from "../app/api/webhooks/xendit/route";
import { sendConsultationPaymentEmailToAdmin } from "../lib/mailer";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("../lib/mailer", () => ({
  sendConsultationPaymentEmailToAdmin: vi.fn().mockResolvedValue(undefined),
}));

import { createAdminClient } from "../lib/supabase/server";

type Chain = {
  adminMock: { from: ReturnType<typeof vi.fn> };
  update: ReturnType<typeof vi.fn>;
};

function buildAdminClientMock(paymentRow?: {
  status?: string;
  service_type?: string;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: {
      user_id: "u1",
      amount: 50,
      status: paymentRow?.status ?? "failed",
      payment_method: "ewallet",
      transaction_code: "srrv-consult-u1-abc123",
      service_type: paymentRow?.service_type ?? "consultation",
    },
    error: null,
  });

  const updateFn = vi.fn().mockImplementation(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ maybeSingle })),
      })),
    })),
  }));

  const from = vi.fn((table: string) => {
    if (table === "payments") return { update: updateFn };
    return { select: vi.fn().mockResolvedValue({ data: null, error: null }) };
  });

  return { adminMock: { from: from as ReturnType<typeof vi.fn> }, update: updateFn } as unknown as Chain;
}

function makeRequest(payload: unknown, token = "secret") {
  return new Request("http://localhost/api/webhooks/xendit", {
    method: "POST",
    headers: { "x-callback-token": token },
    body: JSON.stringify(payload),
  });
}

describe("xendit webhook expiry handling", () => {
  let mock: Chain;

  beforeEach(() => {
    mock = buildAdminClientMock();
    vi.mocked(createAdminClient).mockReturnValue(mock.adminMock as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("marks the payment failed on an EXPIRED event", async () => {
    const res = await POST(
      makeRequest({
        event: "invoice.expired",
        data: { external_id: "srrv-consult-u1-abc123", status: "EXPIRED" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({
      status: "failed",
      payment_method: "ewallet",
      updated_at: expect.any(String),
    });
    expect(sendConsultationPaymentEmailToAdmin).not.toHaveBeenCalled();
  });

  it("marks the payment failed on a FAILED event", async () => {
    const res = await POST(
      makeRequest({
        data: { external_id: "srrv-consult-u1-abc123", status: "FAILED" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({
      status: "failed",
      payment_method: "ewallet",
      updated_at: expect.any(String),
    });
    expect(sendConsultationPaymentEmailToAdmin).not.toHaveBeenCalled();
  });

  it("marks the payment success on a PAID event", async () => {
    const res = await POST(
      makeRequest({
        data: { external_id: "srrv-consult-u1-abc123", status: "PAID" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({
      status: "success",
      payment_method: "ewallet",
      updated_at: expect.any(String),
    });
  });

  it("returns 401 when the token mismatches", async () => {
    const res = await POST(
      makeRequest({ data: { external_id: "x", status: "EXPIRED" } }, "wrong-token"),
    );

    expect(res.status).toBe(401);
    expect(mock.adminMock.from).not.toHaveBeenCalled();
  });

  it("ignores unknown statuses without updating the payment", async () => {
    const res = await POST(
      makeRequest({ data: { external_id: "srrv-consult-u1-abc123", status: "PENDING" } }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).not.toHaveBeenCalled();
  });
});