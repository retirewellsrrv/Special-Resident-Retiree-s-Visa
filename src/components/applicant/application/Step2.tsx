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
import { Step2Data } from "./types";
import { INPUT_CLASS, SELECT_TRIGGER_CLASS, LABEL_CLASS } from "./constants";
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
              value={data.phoneNumber.replace(/^\+\d+\s?/, "")}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                onChange("phoneNumber", value);
              }}
              className={cn(
                INPUT_CLASS,
                errors.phoneNumber && "border-red-500",
              )}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
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
          value={data.streetAddress}
          onChange={(e) => onChange("streetAddress", e.target.value)}
          className={cn(INPUT_CLASS, errors.streetAddress && "border-red-500")}
        />
        {errors.streetAddress && (
          <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>
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
        <Label htmlFor="phAddress" className={LABEL_CLASS}>
          Address or Hotel Name (if known)
        </Label>
        <Input
          id="phAddress"
          placeholder="Leave blank if undecided"
          value={data.phAddress}
          onChange={(e) => onChange("phAddress", e.target.value)}
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
            <Label htmlFor="ecName" className={LABEL_CLASS}>
              Emergency Contact Name
            </Label>
            <Input
              id="ecName"
              placeholder="Full legal name"
              value={data.emergencyName}
              onChange={(e) => onChange("emergencyName", e.target.value)}
              className={cn(
                INPUT_CLASS,
                errors.emergencyName && "border-red-500",
              )}
            />
            {errors.emergencyName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.emergencyName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ecRelationship" className={LABEL_CLASS}>
              Relationship
            </Label>
            <Input
              id="ecRelationship"
              placeholder="e.g. Spouse, Son, Lawyer"
              value={data.emergencyRelationship}
              onChange={(e) =>
                onChange("emergencyRelationship", e.target.value)
              }
              className={cn(
                INPUT_CLASS,
                errors.emergencyRelationship && "border-red-500",
              )}
            />
            {errors.emergencyRelationship && (
              <p className="text-sm text-red-500 mt-1">
                {errors.emergencyRelationship}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="ecPhone" className={LABEL_CLASS}>
            Emergency Contact Phone Number
          </Label>
          <Input
            id="ecPhone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Include country code"
            value={data.emergencyPhone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              onChange("emergencyPhone", value);
            }}
            className={cn(
              INPUT_CLASS,
              errors.emergencyPhone && "border-red-500",
            )}
          />
          {errors.emergencyPhone && (
            <p className="text-sm text-red-500 mt-1">{errors.emergencyPhone}</p>
          )}
        </div>
      </div>
    </>
  );
}
