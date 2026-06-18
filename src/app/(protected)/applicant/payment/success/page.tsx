import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/server";
import xenditClient, { mapPaymentMethod } from "@/lib/xendit";

interface Props {
  searchParams: Promise<{
    id?: string;
    external_id?: string;
    status?: string;
    amount?: string;
    currency?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams;

  console.log("[payment-success] external_id:", params.external_id);

  let verifiedStatus: string | undefined;
  let verifiedExternalId: string | undefined;

  if (params.external_id) {
    try {
      const invoices = await xenditClient.Invoice.getInvoices({
        externalId: params.external_id,
        limit: 1,
      });

      console.log("[payment-success] invoices found:", invoices?.length);

      const invoice = invoices[0];
      if (invoice) {
        verifiedStatus = invoice.status;
        verifiedExternalId = invoice.externalId;

        console.log("[payment-success] invoice status:", invoice.status);

        if (invoice.status === "PAID") {
          const supabase = createAdminClient();
          const paymentMethod = mapPaymentMethod(invoice.paymentMethod);
          const { error: updateError } = await supabase
            .from("payments")
            .update({
              status: "success",
              payment_method: paymentMethod,
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_code", invoice.externalId);

          console.log("[payment-success] update result:", updateError?.message ?? "ok");
        }
      }
    } catch (e) {
      console.error("[payment-success] Xendit API error:", e);
    }
  }

  const displayStatus = params.status ?? verifiedStatus;
  const displayExternalId = params.external_id ?? verifiedExternalId;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {displayExternalId && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-medium">{displayExternalId}</span>
            </div>
          )}
          {params.amount && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {params.currency ? `${params.currency} ` : ""}
                {parseFloat(params.amount).toLocaleString()}
              </span>
            </div>
          )}
          {displayStatus && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">
                {displayStatus}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" asChild>
            <Link href="/applicant/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/services">View Services</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
