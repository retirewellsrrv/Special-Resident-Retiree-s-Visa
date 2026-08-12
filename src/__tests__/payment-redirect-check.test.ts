import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  resolveAppOrigin,
  verifyPaymentRedirects,
  paymentRedirectErrorMessage,
} from "../lib/payment-redirect-check";

describe("resolveAppOrigin", () => {
  const envBackup = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (envBackup === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = envBackup;
    }
    vi.unstubAllGlobals();
  });

  it("prefers the configured site URL over the header origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";
    expect(resolveAppOrigin("https://header.example.com")).toBe("https://app.example.com");
  });

  it("falls back to the header origin", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(resolveAppOrigin("https://header.example.com")).toBe("https://header.example.com");
  });

  it("falls back to localhost when neither is available", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(resolveAppOrigin(null)).toBe("http://localhost:3000");
  });

  it("trims trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/";
    expect(resolveAppOrigin(null)).toBe("https://app.example.com");
  });
});

describe("verifyPaymentRedirects", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, { status: 200 }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok when all endpoints are reachable", async () => {
    const result = await verifyPaymentRedirects("https://app.example.com");

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every((c) => c.reachable)).toBe(true);
  });

  it("flags a 404 endpoint as unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 404 }))
        .mockResolvedValue(new Response(null, { status: 200 })),
    );

    const result = await verifyPaymentRedirects("https://app.example.com");

    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.includes("webhook callback"))).toBe(true);
  });

  it("flags endpoints that fail to fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await verifyPaymentRedirects("https://app.example.com");

    expect(result.ok).toBe(false);
    expect(result.checks.every((c) => !c.reachable)).toBe(true);
  });

  it("builds error messages from the unreachable endpoints", () => {
    const result = {
      ok: false,
      issues: ["webhook callback (https://app.example.com/api/webhooks/xendit)"],
      checks: [],
    };
    expect(paymentRedirectErrorMessage(result)).toContain(
      "webhook callback (https://app.example.com/api/webhooks/xendit)",
    );
  });
});