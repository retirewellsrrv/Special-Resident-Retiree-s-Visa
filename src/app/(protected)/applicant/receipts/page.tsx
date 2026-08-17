"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, CalendarDays, Eye, Package } from "lucide-react";
import { getApplicantReceipts } from "@/actions/applicant/application";
import type { ApplicantReceipt } from "@/actions/applicant/application";

const SERVICE_LABELS: Record<string, string> = {
  application: "SRRV Application Fee",
  consultation: "SRRV Consultation Fee",
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ApplicantReceipt[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicantReceipts().then((data) => {
      setReceipts(data ?? []);
      setLoading(false);
    });
  }, []);

  const receiptList = receipts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-neutral-800">
          Receipts &amp; Invoices
        </h1>
        <p className="text-sm text-brand-neutral-400 mt-1">
          View all your payment receipts and invoices.
        </p>
      </div>

      <Card className="rounded-xl border border-brand-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-brand-neutral-800">
            Payment History
          </CardTitle>
          <p className="text-sm text-brand-neutral-400">
            A complete record of your transactions with Retire Well SRRV.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-brand-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : receiptList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="h-14 w-14 rounded-full bg-brand-neutral-100 flex items-center justify-center">
                <Receipt className="h-7 w-7 text-brand-neutral-400" />
              </div>
              <p className="text-sm text-brand-neutral-500">
                No receipts or invoices yet.
              </p>
              <p className="text-xs text-brand-neutral-400 max-w-sm">
                Once you complete a payment, your receipt will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receiptList.map((receipt) => (
                <div
                  key={receipt.transactionCode}
                  className="flex items-center justify-between gap-3 p-4 rounded-lg border border-brand-neutral-200 bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-neutral-100 flex items-center justify-center flex-shrink-0">
                      {receipt.serviceType === "consultation" ? (
                        <CalendarDays className="w-5 h-5 text-brand-neutral-500" />
                      ) : (
                        <Package className="w-5 h-5 text-brand-neutral-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-neutral-800 truncate">
                        {SERVICE_LABELS[receipt.serviceType] ?? receipt.serviceType}
                      </p>
                      <p className="text-xs text-brand-neutral-400 mt-0.5 truncate font-mono">
                        {receipt.transactionCode}
                      </p>
                      <p className="text-xs text-brand-neutral-400 mt-0.5 truncate">
                        {new Date(receipt.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-neutral-800">
                        ₱{Number(receipt.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-brand-neutral-400 mt-0.5 capitalize">
                        {receipt.paymentMethod.replace(/_/g, " ")}
                      </p>
                    </div>
                    <StatusChip status={receipt.status} />
                    {receipt.status === "success" && (
                      <Link
                        href={`/applicant/payment/success?external_id=${receipt.transactionCode}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1A2B] hover:text-[#6f1522] border border-[#8B1A2B]/30 hover:bg-[#8B1A2B]/5 rounded-md px-3 py-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
