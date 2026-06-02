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

export function Step2({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string) => void;
}) {
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
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label htmlFor="phone" className={LABEL_CLASS}>
            Phone Number
          </Label>
          <div className="flex items-end gap-2">
            <Select
              value={data.phoneCode}
              onValueChange={(v) => onChange("phoneCode", v)}
            >
              <SelectTrigger
                className={cn(SELECT_TRIGGER_CLASS, "w-[120px] shrink-0")}
              >
                <SelectValue placeholder="+1 (USA)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+1">+1 (USA)</SelectItem>
                <SelectItem value="+44">+44 (UK)</SelectItem>
                <SelectItem value="+61">+61 (AUS)</SelectItem>
                <SelectItem value="+63">+63 (PH)</SelectItem>
                <SelectItem value="+81">+81 (JP)</SelectItem>
                <SelectItem value="+49">+49 (DE)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone Number"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
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
          className={INPUT_CLASS}
        />
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
            className={INPUT_CLASS}
          />
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
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="zip" className={LABEL_CLASS}>
            Zip / Postal Code
          </Label>
          <Input
            id="zip"
            placeholder="e.g. 90210"
            value={data.zip}
            onChange={(e) => onChange("zip", e.target.value)}
            className={INPUT_CLASS}
          />
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
            className={INPUT_CLASS}
          />
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
              value={data.ecName}
              onChange={(e) => onChange("ecName", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <Label htmlFor="ecRelationship" className={LABEL_CLASS}>
              Relationship
            </Label>
            <Input
              id="ecRelationship"
              placeholder="e.g. Spouse, Son, Lawyer"
              value={data.ecRelationship}
              onChange={(e) => onChange("ecRelationship", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ecPhone" className={LABEL_CLASS}>
            Emergency Contact Phone Number
          </Label>
          <Input
            id="ecPhone"
            type="tel"
            placeholder="Include country code"
            value={data.ecPhone}
            onChange={(e) => onChange("ecPhone", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </>
  );
}
