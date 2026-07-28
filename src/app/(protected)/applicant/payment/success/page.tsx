"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getPaymentReceipt } from "@/actions/applicant/application";
import type { PaymentReceiptData } from "@/actions/applicant/application";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get("external_id");
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!externalId) {
      setLoading(false);
      return;
    }
    getPaymentReceipt(externalId)
      .then((data) => {
        setReceipt(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [externalId]);

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-neutral-400" />
      </main>
    );
  }

  if (!receipt) {
    return (
      <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4 gap-2">
        <p className="text-sm text-brand-neutral-400">Receipt not found.</p>
        <p className="text-xs text-brand-neutral-300 max-w-md text-center">
          This can happen if the payment reference in the URL doesn&apos;t match our records.
          Check your dashboard for the latest payment status.
        </p>
        <Button
          variant="outline"
          className="mt-4 text-sm"
          onClick={() => window.location.href = "/applicant/dashboard"}
        >
          Go to Dashboard
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <Card className="w-full border-2 border-[#D4C5B8] bg-white shadow-xl rounded-xl">
          <CardContent className="pt-8 pb-4 flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-[#7A1F2B] flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-serif text-[#3B2A28] mb-2 tracking-tight">
              Thank You
            </h1>
            <p className="text-center text-sm text-[#8A7B72] max-w-md leading-relaxed">
              Your payment was successful. An official copy of this receipt has
              been sent to your registered email address. Your SRRV application
              is now officially under review by our heritage desk.
            </p>
          </CardContent>

          <Separator className="bg-[#EFE6DC]" />

          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-[#7A1F2B] font-serif">
                  Retire Well SRRV
                </h2>
                <p className="text-xs text-[#A89A8F] uppercase tracking-wide mt-0.5">
                  Official Transaction Receipt
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-[#3B2A28] font-medium">
                  Transaction Code: {receipt.transactionCode}
                </p>
                <p className="text-[#A89A8F] text-xs mt-1">
                  Date: {new Date(receipt.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="mt-1 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-green-100 text-green-800 border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    Paid
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-[#EFE6DC] mb-6" />

            <div className="flex justify-between text-xs uppercase tracking-wide text-[#A89A8F] mb-4">
              <span>Description</span>
              <span>Amount</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#3B2A28]">
                SRRV Application Fee
              </span>
              <span className="text-[#3B2A28] font-medium">
                ₱{Number(receipt.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Separator className="bg-[#EFE6DC] my-6" />

            <div className="flex justify-end">
              <div className="flex justify-between w-full max-w-[220px] text-base">
                <span className="font-semibold text-[#3B2A28]">Total Paid</span>
                <span className="font-bold text-[#7A1F2B]">
                  ₱{Number(receipt.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>

          <Separator className="bg-[#EFE6DC]" />

          <div className="flex items-center justify-between px-6 py-4 bg-[#FBF8F4]">
            <div className="flex items-center gap-2 text-sm text-[#3B2A28]">
              <CreditCard className="h-4 w-4 text-[#8A7B72]" />
              <span className="capitalize">{receipt.paymentMethod.replace(/_/g, " ")}</span>
            </div>
            <span className="text-xs text-[#A89A8F]">{receipt.applicationCode}</span>
          </div>
        </Card>

        <div className="flex items-center gap-4 mt-8">
          <Button
            variant="ghost"
            className="text-[#8A7B72] hover:text-[#3B2A28] gap-1.5"
            onClick={() => window.location.href = "/applicant/dashboard"}
          >
            Return to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-white flex items-center justify-center">Loading...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
