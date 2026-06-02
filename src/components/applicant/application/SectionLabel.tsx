import React from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-[#8B1A2B] uppercase mb-4">
      {children}
    </p>
  );
}
