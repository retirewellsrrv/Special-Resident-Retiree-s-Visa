import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import xenditClient from "@/lib/xendit";
import { createInvoiceSchema } from "@/schemas/payment";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Validation failed",
      },
      { status: 400 },
    );
  }

  const {
    amount,
    description,
    payerEmail,
    successRedirectUrl,
    failureRedirectUrl,
    paymentMethods,
    currency,
    metadata,
  } = parsed.data;

  try {
    const invoice = await xenditClient.Invoice.createInvoice({
      data: {
        externalId: `srrv-${user.id}-${randomUUID().slice(0, 8)}`,
        amount,
        description,
        payerEmail: payerEmail ?? user.email,
        successRedirectUrl,
        failureRedirectUrl,
        paymentMethods,
        currency,
        metadata,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
        externalId: invoice.externalId,
        amount: invoice.amount,
        status: invoice.status,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
