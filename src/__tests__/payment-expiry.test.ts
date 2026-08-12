import { describe, it, expect, vi } from "vitest";
import {
  expirePendingPayments,
  DEFAULT_PAYMENT_EXPIRY_HOURS,
  type ExpirePendingPaymentsResult,
} from "../lib/payment-expiry";

function createStableChainMock(
  staleIds: number[] = [],
  selectError: { message: string } | null = null,
  updateError: { message: string } | null = null,
) {
  const chain = {
    from: vi.fn(),
  };

  const result = staleIds.map((id) => ({ id }));
  const ltSpy = vi.fn().mockResolvedValue({ data: result, error: selectError });
  const eqOnUpdateSpy = vi.fn().mockResolvedValue({ data: null, error: updateError });
  const inSpy = vi.fn().mockReturnValue({ eq: eqOnUpdateSpy });
  const updateSpy = vi.fn().mockReturnValue({ in: inSpy });
  const eqSelectSpy = vi.fn().mockReturnValue({ lt: ltSpy });
  const selectSpy = vi.fn().mockReturnValue({ eq: eqSelectSpy });

  chain.from.mockImplementation((table: string) => {
    if (table === "payments" && selectSpy.mock.calls.length === 0) {
      return { select: selectSpy, update: updateSpy };
    }
    return { select: selectSpy, update: updateSpy };
  });

  return {
    from: chain.from,
    select: selectSpy,
    eqSelect: eqSelectSpy,
    lt: ltSpy,
    update: updateSpy,
    in: inSpy,
    eqUpdate: eqOnUpdateSpy,
  };
}

describe("expirePendingPayments", () => {
  it("marks pending payments older than the default threshold as failed", async () => {
    const mock = createStableChainMock([1, 2, 3]);
    const now = new Date("2026-01-01T00:00:00.000Z");

    const result = await expirePendingPayments(mock as never, { now });

    expect(result).toEqual<ExpirePendingPaymentsResult>({
      expired: 3,
      threshold: "2025-12-31T00:00:00.000Z",
    });
    expect(mock.from).toHaveBeenCalledWith("payments");
    expect(mock.select).toHaveBeenCalledWith("id");
    expect(mock.update).toHaveBeenCalledWith({
      status: "failed",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    expect(mock.in).toHaveBeenCalledWith("id", [1, 2, 3]);
    expect(mock.eqUpdate).toHaveBeenCalledWith("status", "pending");
  });

  it("honors a custom maxAgeHours option", async () => {
    const mock = createStableChainMock([7]);
    const now = new Date("2026-01-01T00:00:00.000Z");

    await expirePendingPayments(mock as never, { now, maxAgeHours: 2 });

    expect(mock.lt).toHaveBeenCalledWith(
      "created_at",
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("returns expired: 0 when there are no stale payments", async () => {
    const mock = createStableChainMock([]);
    const result = await expirePendingPayments(mock as never, {
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(result.expired).toBe(0);
    expect(mock.update).not.toHaveBeenCalled();
  });

  it("throws when the select query fails", async () => {
    const mock = createStableChainMock([1], { message: "query failed" });

    await expect(
      expirePendingPayments(mock as never, { now: new Date("2026-01-01T00:00:00.000Z") }),
    ).rejects.toThrow("query failed");
  });

  it("throws when the update query fails", async () => {
    const mock = createStableChainMock([1], null, { message: "update failed" });

    await expect(
      expirePendingPayments(mock as never, { now: new Date("2026-01-01T00:00:00.000Z") }),
    ).rejects.toThrow("update failed");
  });

  it("uses DEFAULT_PAYMENT_EXPIRY_HOURS", () => {
    expect(DEFAULT_PAYMENT_EXPIRY_HOURS).toBe(24);
  });
});