"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ServiceType } from "@/schemas/application";
import { getPublicServicePlans } from "@/actions/admin/service";
import type { ServicePlan } from "@/types/services";
import { Clock, Banknote, Building2, Star, Stethoscope, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TAG_ICONS: Record<string, LucideIcon> = {
  "35+ Years Old": Clock,
  "Term Deposit": Banknote,
  "Real Estate Investment": Building2,
  "*Deposit varies by age": Star,
  "Specialized Care": Stethoscope,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

export function Step3({
  selected,
  onSelect,
  error,
}: {
  selected: ServiceType | "";
  onSelect: (plan: ServiceType) => void;
  error?: string;
}) {
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicServicePlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Visa Selection
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Select the SRRV category that best fits your retirement plan.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full rounded-xl border-2 border-neutral-200 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-32 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-neutral-500">No service plans available at this time.</p>
        ) : (
          plans.map((plan) => {
            const isSelected = selected === plan.type;
            return (
              <button
                key={plan.type}
                type="button"
                onClick={() => onSelect(plan.type)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-5 transition-all",
                  isSelected
                    ? "border-[#8B1A2B] bg-[#fdf5f6]"
                    : "border-neutral-200 bg-white hover:border-neutral-300",
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <span className="text-lg font-bold text-neutral-900">
                      {plan.name}
                    </span>
                    <p className="text-[10px] font-semibold tracking-widest text-[#8B1A2B] uppercase mt-0.5">
                      {plan.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-neutral-900">
                      {formatPrice(plan.price)}
                    </p>
                    {plan.price_note && (
                      <p className="text-xs text-neutral-400">{plan.price_note}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed mb-3">
                  {plan.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag) => {
                    const Icon = TAG_ICONS[tag];
                    return (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                          isSelected
                            ? "bg-[#8B1A2B]/10 text-[#8B1A2B]"
                            : "bg-neutral-100 text-neutral-600",
                        )}
                      >
                        {Icon && <Icon className="w-3 h-3" />}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
