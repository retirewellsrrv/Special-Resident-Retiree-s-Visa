"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  ComboboxTrigger,
  ComboboxInput,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { Step1Data } from "./types";
import { INPUT_CLASS, LABEL_CLASS } from "./constants";

export function Step1({
  data,
  onChange,
}: {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Personal Details
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Please ensure all information matches your passport exactly to prevent
          delays in processing your SRRV application.
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="name" className={LABEL_CLASS}>
          Full Name (As shown in Passport)
        </Label>
        <Input
          id="name"
          placeholder="Enter your full legal name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="dob" className={LABEL_CLASS}>
            Date of Birth
          </Label>
          <Input
            id="dob"
            type="date"
            value={data.birthday}
            onChange={(e) => onChange("birthday", e.target.value)}
            className={cn(INPUT_CLASS, "text-neutral-700")}
          />
        </div>
        <div>
          <Label className={LABEL_CLASS}>Gender</Label>
          <Combobox
            value={data.sex}
            onValueChange={(v) => v && onChange("sex", v)}
          >
            <ComboboxInput
              className={INPUT_CLASS}
              placeholder="Select Gender"
            />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="male">Male</ComboboxItem>
                <ComboboxItem value="female">Female</ComboboxItem>
                <ComboboxItem value="prefer-not">
                  Prefer not to say
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nationality" className={LABEL_CLASS}>
            Nationality
          </Label>
          <Input
            id="nationality"
            placeholder="e.g. United Kingdom"
            value={data.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label className={LABEL_CLASS}>Marital Status</Label>
          <Combobox
            value={data.maritalStatus}
            onValueChange={(v) => v && onChange("maritalStatus", v)}
          >
            <ComboboxInput
              className={INPUT_CLASS}
              placeholder="Select Status"
            />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="single">Single</ComboboxItem>
                <ComboboxItem value="married">Married</ComboboxItem>
                <ComboboxItem value="widowed">Widowed</ComboboxItem>
                <ComboboxItem value="divorced">Divorced</ComboboxItem>
                <ComboboxItem value="separated">Separated</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    </>
  );
}
