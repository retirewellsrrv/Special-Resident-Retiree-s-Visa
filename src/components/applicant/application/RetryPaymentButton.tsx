"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { retryPaymentAction } from "@/actions/applicant/application";
import type { RetryPaymentState } from "@/actions/applicant/application";
import { cn } from "@/lib/utils";

export function RetryPaymentButton({ className }: { className?: string }) {
  const [retryState, retryAction, retryPending] = useActionState<
    RetryPaymentState,
    FormData
  >(retryPaymentAction, { error: null, success: false });

  useEffect(() => {
    if (retryState.success && retryState.invoiceUrl) {
      window.location.href = retryState.invoiceUrl;
    }
  }, [retryState]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {retryState.error && (
        <p className="text-sm text-red-600">{retryState.error}</p>
      )}
      <form action={retryAction}>
        <Button
          type="submit"
          disabled={retryPending}
          className="w-full bg-[#8B1A2B] hover:bg-[#6f1522] text-white"
        >
          {retryPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Payment
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
