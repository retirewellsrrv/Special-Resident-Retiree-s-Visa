import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";
import type { ApplicationFormInput } from "@/schemas/application";
import { INPUT_CLASS, SELECT_TRIGGER_CLASS, LABEL_CLASS } from "./constants";

type Step2Data = {
  [K in keyof Pick<
    ApplicationFormInput,
    | "email"
    | "phone_number"
    | "street"
    | "city"
    | "state"
    | "zip"
    | "country"
    | "ph_address"
    | "emergency_name"
    | "emergency_relationship"
    | "emergency_phone"
  >]: string;
};
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";

export function Step2({
  data,
  onChange,
  errors = {},
}: {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string) => void;
  errors?: Record<string, string>;
}) {
  const CALLING_CODES = (() => {
    const seen = new Map<
      string,
      { countryCode: string; callingCode: string }
    >();

    for (const countryCode of getCountries()) {
      const callingCode = `+${getCountryCallingCode(countryCode)}`;
      if (!seen.has(callingCode)) {
        seen.set(callingCode, { countryCode, callingCode });
      }
    }

    return Array.from(seen.values()).sort((a, b) =>
      a.callingCode.localeCompare(b.callingCode, undefined, { numeric: true }),
    );
  })();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Contact Information
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Please provide your current and future contact details to ensure
          official communications regarding your SRRV application reach you
          promptly.
        </p>
      </div>

      <SectionLabel>Primary Channels</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="email" className={LABEL_CLASS}>
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. john.doe@example.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(INPUT_CLASS, errors.email && "border-red-500")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone" className={LABEL_CLASS}>
            Phone Number
          </Label>
          <div className="flex items-end gap-2">
            <Select>
              <SelectTrigger
                className={cn(SELECT_TRIGGER_CLASS, "w-[120px] shrink-0")}
              >
                <SelectValue placeholder="+1" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="max-h-60 overflow-y-auto"
                style={{ maxHeight: "240px", overflowY: "auto" }}
              >
                {CALLING_CODES.map(({ countryCode, callingCode }) => (
                  <SelectItem key={countryCode} value={callingCode}>
                    {countryCode} {callingCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Phone Number"
              value={data.phone_number.replace(/^\+\d+\s?/, "")}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                onChange("phone_number", value);
              }}
              className={cn(
                INPUT_CLASS,
                errors.phone_number && "border-red-500",
              )}
            />
          </div>
          {errors.phone_number && (
            <p className="text-sm text-red-500 mt-1">{errors.phone_number}</p>
          )}
        </div>
      </div>

      <SectionLabel>Permanent Address (Home Country)</SectionLabel>
      <div className="mb-6">
        <Label htmlFor="street" className={LABEL_CLASS}>
          Street Address
        </Label>
        <Input
          id="street"
          placeholder="House No., Street name, Apartment"
              value={data.street}
              onChange={(e) => onChange("street", e.target.value)}
              className={cn(INPUT_CLASS, errors.street && "border-red-500")}
            />
            {errors.street && (
              <p className="text-sm text-red-500 mt-1">{errors.street}</p>
            )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="city" className={LABEL_CLASS}>
            City
          </Label>
          <Input
            id="city"
            placeholder="City"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={cn(INPUT_CLASS, errors.city && "border-red-500")}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state" className={LABEL_CLASS}>
            State / Province
          </Label>
          <Input
            id="state"
            placeholder="State / Province"
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
            className={cn(INPUT_CLASS, errors.state && "border-red-500")}
          />
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="zip" className={LABEL_CLASS}>
            Zip / Postal Code
          </Label>
          <Input
            id="zip"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 90210"
            value={data.zip}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              onChange("zip", value);
            }}
            className={cn(INPUT_CLASS, errors.zip && "border-red-500")}
          />
          {errors.zip && (
            <p className="text-sm text-red-500 mt-1">{errors.zip}</p>
          )}
        </div>
        <div>
          <Label htmlFor="country" className={LABEL_CLASS}>
            Country
          </Label>
          <Input
            id="country"
            placeholder="Country"
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            className={cn(INPUT_CLASS, errors.country && "border-red-500")}
          />
          {errors.country && (
            <p className="text-sm text-red-500 mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      <SectionLabel>Intended Address in the Philippines</SectionLabel>
      <div className="mb-1">
        <Label htmlFor="ph_address" className={LABEL_CLASS}>
          Address or Hotel Name (if known)
        </Label>
        <Input
          id="ph_address"
          placeholder="Leave blank if undecided"
              value={data.ph_address}
              onChange={(e) => onChange("ph_address", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <p className="text-xs text-neutral-400 italic mb-8">
        This can be updated later if you haven&apos;t finalised your
        accommodation.
      </p>

      <div className="border border-neutral-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-neutral-700 mb-4">
          Emergency Contact
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="emergency_name" className={LABEL_CLASS}>
              Emergency Contact Name
            </Label>
            <Input
              id="emergency_name"
              placeholder="Full legal name"
              value={data.emergency_name}
              onChange={(e) => onChange("emergency_name", e.target.value)}
              className={cn(
                INPUT_CLASS,
                errors.emergency_name && "border-red-500",
              )}
            />
            {errors.emergency_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.emergency_name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="emergency_relationship" className={LABEL_CLASS}>
              Relationship
            </Label>
            <Input
              id="emergency_relationship"
              placeholder="e.g. Spouse, Son, Lawyer"
              value={data.emergency_relationship}
              onChange={(e) =>
                onChange("emergency_relationship", e.target.value)
              }
              className={cn(
                INPUT_CLASS,
                errors.emergency_relationship && "border-red-500",
              )}
            />
            {errors.emergency_relationship && (
              <p className="text-sm text-red-500 mt-1">
                {errors.emergency_relationship}
              </p>
            )}
          </div>
        </div>
        <div>
            <Label htmlFor="emergency_phone" className={LABEL_CLASS}>
              Emergency Contact Phone Number
            </Label>
            <Input
              id="emergency_phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Include country code"
              value={data.emergency_phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                onChange("emergency_phone", value);
              }}
              className={cn(
                INPUT_CLASS,
                errors.emergency_phone && "border-red-500",
              )}
            />
            {errors.emergency_phone && (
              <p className="text-sm text-red-500 mt-1">{errors.emergency_phone}</p>
            )}
        </div>
      </div>
    </>
  );
}
