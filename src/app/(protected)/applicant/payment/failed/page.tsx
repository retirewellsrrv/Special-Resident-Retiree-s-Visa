"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { XCircle, ArrowRight } from "lucide-react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get("external_id");
  const status = searchParams.get("status");
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <Card className="w-full border-2 border-[#D4C5B8] bg-white shadow-xl rounded-xl">
          <CardContent className="pt-8 pb-4 flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-7 w-7 text-red-600" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-serif text-[#3B2A28] mb-2 tracking-tight">
              Payment Failed
            </h1>
            <p className="text-center text-sm text-[#8A7B72] max-w-md leading-relaxed">
              {error || "Something went wrong with your payment. Please try again."}
            </p>
          </CardContent>

          {externalId && (
            <>
              <Separator className="bg-[#EFE6DC]" />
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A7B72]">Transaction Code</span>
                  <span className="text-[#3B2A28] font-medium">{externalId}</span>
                </div>
                {status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A7B72]">Status</span>
                    <span className="font-medium text-red-600 capitalize">{status}</span>
                  </div>
                )}
              </CardContent>
            </>
          )}

          <Separator className="bg-[#EFE6DC]" />

          <CardContent className="py-4 flex flex-col gap-2">
            <Button className="w-full bg-[#7A1B2B] hover:bg-[#651823] text-white" asChild>
              <Link href="/applicant/dashboard">Try Again</Link>
            </Button>
            <Button variant="outline" className="w-full border-[#E8DDD3] text-[#3B2A28] hover:bg-[#F4ECE3]" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 mt-8">
          <Button variant="ghost" className="text-[#8A7B72] hover:text-[#3B2A28] gap-1.5" asChild>
            <Link href="/applicant/dashboard">
              Return to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-white flex items-center justify-center">Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
