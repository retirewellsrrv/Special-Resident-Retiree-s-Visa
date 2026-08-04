"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { INPUT_CLASS } from "@/components/applicant/application/constants";

const COUNTRY_CODES = [
  { code: "63", flag: "🇵🇭", name: "Philippines" },
  { code: "1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "61", flag: "🇦🇺", name: "Australia" },
  { code: "64", flag: "🇳🇿", name: "New Zealand" },
  { code: "65", flag: "🇸🇬", name: "Singapore" },
  { code: "60", flag: "🇲🇾", name: "Malaysia" },
  { code: "81", flag: "🇯🇵", name: "Japan" },
  { code: "82", flag: "🇰🇷", name: "South Korea" },
  { code: "86", flag: "🇨🇳", name: "China" },
  { code: "852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "886", flag: "🇹🇼", name: "Taiwan" },
  { code: "49", flag: "🇩🇪", name: "Germany" },
  { code: "33", flag: "🇫🇷", name: "France" },
  { code: "31", flag: "🇳🇱", name: "Netherlands" },
  { code: "91", flag: "🇮🇳", name: "India" },
];

const DEFAULT_CODE = "63";

function parseValue(value: string) {
  const digits = value.replace(/\D/g, "");
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => digits.startsWith(c.code));
  if (match) {
    return { code: match.code, local: digits.slice(match.code.length) };
  }
  return { code: DEFAULT_CODE, local: digits };
}

export function PhoneInput({
  id,
  value,
  onChange,
  placeholder = "Phone number",
  className,
  invalid = false,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
}) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [local, setLocal] = useState("");

  useEffect(() => {
    const parsed = parseValue(value);
    setCode(parsed.code);
    setLocal(parsed.local);
  }, [value]);

  return (
    <div className={cn("flex w-full items-end", className)}>
      <div className="relative shrink-0">
        <select
          aria-label="Country code"
          value={code}
          onChange={(e) => {
            const next = e.target.value;
            setCode(next);
            onChange(next + local.replace(/^0+/, ""));
          }}
          className={cn(
            "appearance-none cursor-pointer border-0 border-b border-neutral-300 rounded-none bg-transparent py-2 pr-5 pl-0 text-sm text-neutral-600 outline-none focus-visible:border-[#8B1A2B]",
            invalid && "border-red-500",
          )}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} +{c.code}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
      </div>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        value={local}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          setLocal(digits);
          onChange(code + digits);
        }}
        className={cn(
          INPUT_CLASS,
          "ml-2 min-w-0 flex-1",
          invalid && "border-red-500",
        )}
      />
    </div>
  );
}
