"use client";

import { cn } from "@/lib/utils";
import { ServiceType } from "./types";
import { servicePlans } from "./service-plans";

export function Step3({
  selected,
  onSelect,
  error,
}: {
  selected: ServiceType;
  onSelect: (plan: ServiceType) => void;
  error?: string;
}) {
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
        {servicePlans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
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
                    {plan.price}
                  </p>
                  <p className="text-xs text-neutral-400">{plan.priceNote}</p>
                </div>
              </div>

              <p className="text-sm text-neutral-500 leading-relaxed mb-3">
                {plan.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {plan.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                      isSelected
                        ? "bg-[#8B1A2B]/10 text-[#8B1A2B]"
                        : "bg-neutral-100 text-neutral-600",
                    )}
                  >
                    {tag.icon}
                    {tag.label}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
