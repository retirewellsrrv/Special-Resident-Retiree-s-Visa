import { NextResponse } from "next/server";
import { expirePendingPayments } from "@/lib/payment-expiry";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await expirePendingPayments();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("expirePendingPayments cron error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to expire pending payments" },
      { status: 500 },
    );
  }
}
