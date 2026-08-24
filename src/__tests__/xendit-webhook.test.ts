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

type PaymentRow = {
  id?: number;
  user_id?: string;
  amount?: number;
  status?: string;
  payment_method?: string;
  transaction_code?: string;
  service_type?: string;
};

function makeChain(resolveValue: unknown) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.neq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolveValue);
  chain.single = vi.fn().mockResolvedValue(resolveValue);
  return chain as unknown as ReturnType<typeof vi.fn> & {
    maybeSingle: ReturnType<typeof vi.fn>;
  };
}

function buildAdminClientMock(options?: {
  existingPayment?: PaymentRow | null;
  duplicateSuccess?: PaymentRow | null;
  updatedPayment?: PaymentRow | null;
  consultation?: unknown | null;
  clientProfile?: unknown | null;
}) {
  const existing = options && "existingPayment" in options
    ? options.existingPayment
    : {
        id: 1,
        user_id: "u1",
        service_type: "consultation",
      };
  const updated = options?.updatedPayment ?? {
    user_id: "u1",
    amount: 50,
    status: "failed",
    payment_method: "ewallet",
    transaction_code: "srrv-consult-u1-abc123",
    service_type: "consultation",
  };
  const duplicate = options?.duplicateSuccess ?? null;
  const consultation = options?.consultation ?? null;
  const clientProfile = options?.clientProfile ?? null;

  const selectPayments = vi
    .fn()
    .mockReturnValueOnce(makeChain({ data: existing, error: null }))
    .mockReturnValueOnce(makeChain({ data: duplicate, error: null }))
    .mockReturnValue(makeChain({ data: null, error: null }));

  const updateFn = vi.fn(() => makeChain({ data: updated, error: null }));

  const from = vi.fn((table: string) => {
    if (table === "payments") return { select: selectPayments, update: updateFn };
    if (table === "consultations")
      return { select: vi.fn(() => makeChain({ data: consultation, error: null })) };
    if (table === "client_profiles")
      return { select: vi.fn(() => makeChain({ data: clientProfile, error: null })) };
    return { select: vi.fn().mockResolvedValue({ data: null, error: null }) };
  });

  const adminMock = {
    from: from as ReturnType<typeof vi.fn>,
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { email: "applicant@example.com" } },
          error: null,
        }),
      },
    },
  };

  return { adminMock, update: updateFn };
}

function makeRequest(payload: unknown, token = "secret") {
  return new Request("http://localhost/api/webhooks/xendit", {
    method: "POST",
    headers: { "x-callback-token": token },
    body: JSON.stringify(payload),
  });
}

describe("xendit webhook expiry handling", () => {
  let mock: ReturnType<typeof buildAdminClientMock>;

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

  it("marks the payment failed when a duplicate success already exists", async () => {
    mock = buildAdminClientMock({
      duplicateSuccess: { id: 99 },
    });
    vi.mocked(createAdminClient).mockReturnValue(mock.adminMock as never);

    const res = await POST(
      makeRequest({
        data: { external_id: "srrv-consult-u1-abc123", status: "PAID" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith({
      status: "failed",
      payment_method: "ewallet",
      updated_at: expect.any(String),
    });
  });

  it("does nothing when no pending payment matches the external id", async () => {
    mock = buildAdminClientMock({ existingPayment: null });
    vi.mocked(createAdminClient).mockReturnValue(mock.adminMock as never);

    const res = await POST(
      makeRequest({
        data: { external_id: "srrv-consult-u1-abc123", status: "PAID" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mock.update).not.toHaveBeenCalled();
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
