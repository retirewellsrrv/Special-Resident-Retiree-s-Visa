"use client";

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
import { Step1Data } from "./types";
import { INPUT_CLASS, SELECT_TRIGGER_CLASS, LABEL_CLASS } from "./constants";

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
        <Label htmlFor="fullName" className={LABEL_CLASS}>
          Full Name (As shown in Passport)
        </Label>
        <Input
          id="fullName"
          placeholder="Enter your full legal name"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
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
            value={data.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            className={cn(INPUT_CLASS, "text-neutral-700")}
          />
        </div>
        <div>
          <Label className={LABEL_CLASS}>Gender</Label>
          <Select
            value={data.gender}
            onValueChange={(v) => onChange("gender", v)}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="prefer-not">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
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
          <Select
            value={data.maritalStatus}
            onValueChange={(v) => onChange("maritalStatus", v)}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
