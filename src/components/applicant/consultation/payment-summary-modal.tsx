"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { usdToPhp } from "@/lib/usd-conversion";

interface PaymentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: string;
  date: string;
  purpose: string;
  isSubmitting: boolean;
}

export function PaymentSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  mode,
  date,
  purpose,
  isSubmitting,
}: PaymentSummaryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="bg-white rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-[#8B1A2B] mb-4">
          Payment Summary
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mode:</span>
            <span className="font-medium text-gray-900">{mode || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-900">{date || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Purpose:</span>
            <span className="font-medium text-gray-900 text-right max-w-[60%]">
              {purpose || "—"}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">USD 50</p>
            <p className="text-sm text-gray-500 mt-1">
              Approx. PHP {usdToPhp(50).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-[#8B1A2B] hover:bg-[#6f1522] text-white"
          >
            {isSubmitting ? "Processing..." : "Confirm & Pay"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
