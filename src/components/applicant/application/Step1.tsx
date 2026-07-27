"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxInput,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationFormInput } from "@/schemas/application";
import { SectionLabel } from "./SectionLabel";
import { INPUT_CLASS, LABEL_CLASS } from "./constants";

export type EducationEntry = {
  id: string;
  school: string;
  location: string;
  start_date: string;
  end_date: string;
};

export type EmploymentEntry = {
  id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  contact_no: string;
  company_address: string;
};

type Step1Data = {
  [K in keyof Pick<ApplicationFormInput,
    | "last_name"
    | "first_name"
    | "middle_name"
    | "birthday"
    | "place_of_birth"
    | "sex"
    | "religion"
    | "nationality"
    | "marital_status"
    | "height"
    | "weight"
    | "passport_number"
    | "passport_place_of_issue"
    | "passport_date_of_issue"
    | "passport_valid_until"
    | "future_plan"
  >]: string;
} & { educations: EducationEntry[]; employments: EmploymentEntry[]; future_plan_other: string; date_of_arrival: string; exp_date_tourist_visa: string; entry_visa_type: string; entry_visa_other: string };

type Step1Field = keyof Step1Data;
type Step1Value<F extends Step1Field> = Step1Data[F];

export function Step1({
  data,
  onChange,
  errors = {},
}: {
  data: Step1Data;
  onChange: <F extends Step1Field>(field: F, value: Step1Value<F>) => void;
  errors?: Record<string, string>;
}) {
  const addEducation = () => {
    const next: EducationEntry = {
      id: crypto.randomUUID(),
      school: "",
      location: "",
      start_date: "",
      end_date: "",
    };
    onChange("educations", [...data.educations, next]);
  };

  const updateEducation = (
    id: string,
    field: keyof EducationEntry,
    value: string,
  ) => {
    onChange(
      "educations",
      data.educations.map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    );
  };

  const removeEducation = (id: string) => {
    onChange(
      "educations",
      data.educations.filter((e) => e.id !== id),
    );
  };

  const addEmployment = () => {
    const next: EmploymentEntry = {
      id: crypto.randomUUID(),
      company_name: "",
      job_title: "",
      start_date: "",
      end_date: "",
      contact_no: "",
      company_address: "",
    };
    onChange("employments", [...data.employments, next]);
  };

  const updateEmployment = (
    id: string,
    field: keyof EmploymentEntry,
    value: string,
  ) => {
    onChange(
      "employments",
      data.employments.map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    );
  };

  const removeEmployment = (id: string) => {
    onChange(
      "employments",
      data.employments.filter((e) => e.id !== id),
    );
  };

  useEffect(() => {
    if (data.educations.length === 0) {
      onChange("educations", [{
        id: crypto.randomUUID(),
        school: "",
        location: "",
        start_date: "",
        end_date: "",
      }]);
    }
    if (data.employments.length === 0) {
      onChange("employments", [{
        id: crypto.randomUUID(),
        company_name: "",
        job_title: "",
        start_date: "",
        end_date: "",
        contact_no: "",
        company_address: "",
      }]);
    }
  }, []);

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

      {/* Personal Information */}
      <div className="mb-4">
        <SectionLabel>Personal Information</SectionLabel>
      </div>
      <div className="border-t border-red-200 mb-6" />

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <Label htmlFor="last_name" className={LABEL_CLASS}>
            Last Name <span className="text-red-500">*</span> <span className="text-neutral-400 font-normal">(As shown in passport)</span>
          </Label>
          <Input
            id="last_name"
            placeholder="Last name"
            value={data.last_name}
            onChange={(e) => onChange("last_name", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.last_name && "border-red-500")}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="first_name" className={LABEL_CLASS}>
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="First name"
            value={data.first_name}
            onChange={(e) => onChange("first_name", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.first_name && "border-red-500")}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="middle_name" className={LABEL_CLASS}>
            Middle Name / alias <span className="text-red-500">*</span>
          </Label>
          <Input
            id="middle_name"
            placeholder="Middle name or alias"
            value={data.middle_name}
            onChange={(e) => onChange("middle_name", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.middle_name && "border-red-500")}
          />
          {errors.middle_name && (
            <p className="text-sm text-red-500 mt-1">{errors.middle_name}</p>
          )}
        </div>
      </div>

      {/* Birth details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="dob" className={LABEL_CLASS}>
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dob"
            type="date"
            value={data.birthday}
            onChange={(e) => onChange("birthday", e.target.value)}
            className={cn(
              INPUT_CLASS,
              "text-neutral-700",
              errors.birthday && "border-red-500",
            )}
          />
          {errors.birthday && (
            <p className="text-sm text-red-500 mt-1">{errors.birthday}</p>
          )}
        </div>
        <div>
          <Label htmlFor="place_of_birth" className={LABEL_CLASS}>
            Place of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="place_of_birth"
            placeholder="e.g. Manila, Philippines"
            value={data.place_of_birth}
            onChange={(e) => onChange("place_of_birth", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.place_of_birth && "border-red-500")}
          />
          {errors.place_of_birth && (
            <p className="text-sm text-red-500 mt-1">{errors.place_of_birth}</p>
          )}
        </div>
      </div>

      {/* Gender / Religion / Citizenship */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <Label className={LABEL_CLASS}>Gender <span className="text-red-500">*</span></Label>
          <Combobox
            value={data.sex}
            onValueChange={(v) => v && onChange("sex", v)}
          >
            <ComboboxInput
              className={cn(INPUT_CLASS, errors.sex && "border-red-500")}
              placeholder="Select Gender"
            />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="male">Male</ComboboxItem>
                <ComboboxItem value="female">Female</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.sex && (
            <p className="text-sm text-red-500 mt-1">{errors.sex}</p>
          )}
        </div>
        <div>
          <Label htmlFor="religion" className={LABEL_CLASS}>
            Religion <span className="text-red-500">*</span>
          </Label>
          <Input
            id="religion"
            placeholder="e.g. Roman Catholic"
            value={data.religion}
            onChange={(e) => onChange("religion", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.religion && "border-red-500")}
          />
          {errors.religion && (
            <p className="text-sm text-red-500 mt-1">{errors.religion}</p>
          )}
        </div>
        <div>
          <Label htmlFor="nationality" className={LABEL_CLASS}>
            Citizenship <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nationality"
            placeholder="e.g. United Kingdom"
            value={data.nationality}
            onChange={(e) => onChange("nationality", e.target.value.replace(/[0-9]/g, ""))}
            className={cn(INPUT_CLASS, errors.nationality && "border-red-500")}
          />
          {errors.nationality && (
            <p className="text-sm text-red-500 mt-1">{errors.nationality}</p>
          )}
        </div>
      </div>

      {/* Civil status / Height / Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <Label className={LABEL_CLASS}>Civil Status <span className="text-red-500">*</span></Label>
          <Combobox
            value={data.marital_status}
            onValueChange={(v) => v && onChange("marital_status", v)}
          >
            <ComboboxInput
              className={cn(
                INPUT_CLASS,
                errors.marital_status && "border-red-500",
              )}
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
          {errors.marital_status && (
            <p className="text-sm text-red-500 mt-1">{errors.marital_status}</p>
          )}
        </div>
        <div>
          <Label htmlFor="height" className={LABEL_CLASS}>
            Height (m) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="height"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="e.g. 1.70"
            value={data.height}
            onChange={(e) => onChange("height", e.target.value)}
            className={cn(INPUT_CLASS, errors.height && "border-red-500")}
          />
          {errors.height && (
            <p className="text-sm text-red-500 mt-1">{errors.height}</p>
          )}
        </div>
        <div>
          <Label htmlFor="weight" className={LABEL_CLASS}>
            Weight (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 65"
            value={data.weight}
            onChange={(e) => onChange("weight", e.target.value)}
            className={cn(INPUT_CLASS, errors.weight && "border-red-500")}
          />
          {errors.weight && (
            <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
          )}
        </div>
      </div>

      {/* Passport details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="passport_number" className={LABEL_CLASS}>
            Passport Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passport_number"
            placeholder="Passport number"
            value={data.passport_number}
            onChange={(e) => onChange("passport_number", e.target.value)}
            className={cn(INPUT_CLASS, errors.passport_number && "border-red-500")}
          />
          {errors.passport_number && (
            <p className="text-sm text-red-500 mt-1">{errors.passport_number}</p>
          )}
        </div>
        <div>
          <Label htmlFor="passport_place_of_issue" className={LABEL_CLASS}>
            Place of Issue <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passport_place_of_issue"
            placeholder="e.g. London"
            value={data.passport_place_of_issue}
            onChange={(e) => onChange("passport_place_of_issue", e.target.value)}
            className={cn(
              INPUT_CLASS,
              errors.passport_place_of_issue && "border-red-500",
            )}
          />
          {errors.passport_place_of_issue && (
            <p className="text-sm text-red-500 mt-1">
              {errors.passport_place_of_issue}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="passport_date_of_issue" className={LABEL_CLASS}>
            Date of Issue <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passport_date_of_issue"
            type="date"
            value={data.passport_date_of_issue}
            onChange={(e) => onChange("passport_date_of_issue", e.target.value)}
            className={cn(
              INPUT_CLASS,
              "text-neutral-700",
              errors.passport_date_of_issue && "border-red-500",
            )}
          />
          {errors.passport_date_of_issue && (
            <p className="text-sm text-red-500 mt-1">
              {errors.passport_date_of_issue}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="passport_valid_until" className={LABEL_CLASS}>
            Valid Until <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passport_valid_until"
            type="date"
            value={data.passport_valid_until}
            onChange={(e) => onChange("passport_valid_until", e.target.value)}
            className={cn(
              INPUT_CLASS,
              "text-neutral-700",
              errors.passport_valid_until && "border-red-500",
            )}
          />
          {errors.passport_valid_until && (
            <p className="text-sm text-red-500 mt-1">
              {errors.passport_valid_until}
            </p>
          )}
        </div>
      </div>

      {/* Educational Attainment */}
      <div className="mt-8 mb-4">
        <SectionLabel>Educational Attainment</SectionLabel>
      </div>
      <div className="border-t border-red-200 mb-6" />
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="font-medium py-2 pr-3">School</th>
              <th className="font-medium py-2 pr-3">Location</th>
              <th className="font-medium py-2 pr-3">Start Date</th>
              <th className="font-medium py-2 pr-3">End Date</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {data.educations.map((entry) => (
              <tr key={entry.id} className="border-b border-neutral-100">
                <td className="py-2 pr-3">
                  <Input
                    placeholder="School name"
                    value={entry.school}
                    onChange={(e) =>
                      updateEducation(entry.id, "school", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="e.g. Manila, Philippines"
                    value={entry.location}
                    onChange={(e) =>
                      updateEducation(entry.id, "location", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="date"
                    value={entry.start_date}
                    onChange={(e) =>
                      updateEducation(entry.id, "start_date", e.target.value)
                    }
                    className={cn(INPUT_CLASS, "text-neutral-700")}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="date"
                    value={entry.end_date}
                    onChange={(e) =>
                      updateEducation(entry.id, "end_date", e.target.value)
                    }
                    className={cn(INPUT_CLASS, "text-neutral-700")}
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeEducation(entry.id)}
                    className="text-neutral-400 hover:text-red-500"
                    aria-label="Remove education"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={addEducation}
        className="mb-8 text-sm text-neutral-600 hover:text-neutral-900 px-0"
      >
        <Plus size={16} className="mr-1" />
        Add another educational attainment
      </Button>

      {/* Employment History */}
      <div className="mt-8 mb-4">
        <SectionLabel>Employment History</SectionLabel>
      </div>
      <div className="border-t border-red-200 mb-6" />
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="font-medium py-2 pr-3">Company Name</th>
              <th className="font-medium py-2 pr-3">Job Title</th>
              <th className="font-medium py-2 pr-3">Contact No.</th>
              <th className="font-medium py-2 pr-3">Company Address</th>
              <th className="font-medium py-2 pr-3">Start Date</th>
              <th className="font-medium py-2 pr-3">End Date</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {data.employments.map((entry) => (
              <tr key={entry.id} className="border-b border-neutral-100">
                <td className="py-2 pr-3">
                  <Input
                    placeholder="Company name"
                    value={entry.company_name}
                    onChange={(e) =>
                      updateEmployment(entry.id, "company_name", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="e.g. Software Engineer"
                    value={entry.job_title}
                    onChange={(e) =>
                      updateEmployment(entry.id, "job_title", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="Contact number"
                    value={entry.contact_no}
                    onChange={(e) =>
                      updateEmployment(entry.id, "contact_no", e.target.value.replace(/\D/g, ""))
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="Company address"
                    value={entry.company_address}
                    onChange={(e) =>
                      updateEmployment(entry.id, "company_address", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="date"
                    value={entry.start_date}
                    onChange={(e) =>
                      updateEmployment(entry.id, "start_date", e.target.value)
                    }
                    className={cn(INPUT_CLASS, "text-neutral-700")}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="date"
                    value={entry.end_date}
                    onChange={(e) =>
                      updateEmployment(entry.id, "end_date", e.target.value)
                    }
                    className={cn(INPUT_CLASS, "text-neutral-700")}
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeEmployment(entry.id)}
                    className="text-neutral-400 hover:text-red-500"
                    aria-label="Remove employment"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={addEmployment}
        className="mb-8 text-sm text-neutral-600 hover:text-neutral-900 px-0"
      >
        <Plus size={16} className="mr-1" />
        Add another employment history
      </Button>

      {/* Future Plans in the Philippines */}
      <div className="mt-8 mb-4">
        <SectionLabel>Future Plans in the Philippines</SectionLabel>
      </div>
      <div className="border-t border-red-200 mb-6" />
      <p className="text-sm text-neutral-500 leading-relaxed mb-4">
        Aside from retirement, what are the plans/future actions in the Philippines?
      </p>
      <RadioGroup
        value={data.future_plan}
        onValueChange={(v) => onChange("future_plan", v)}
        className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        <div className="flex items-center gap-3">
          <RadioGroupItem value="tourism" id="plan_tourism" />
          <Label htmlFor="plan_tourism" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Tourism / Travel
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="investment" id="plan_investment" />
          <Label htmlFor="plan_investment" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Investment
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="employment" id="plan_employment" />
          <Label htmlFor="plan_employment" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Employment
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="others" id="plan_others" />
          <Label htmlFor="plan_others" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Others (Please specify)
          </Label>
        </div>
      </RadioGroup>
      {data.future_plan === "others" && (
        <Input
          placeholder="Please specify your plans"
          value={data.future_plan_other}
          onChange={(e) => onChange("future_plan_other", e.target.value)}
          className={INPUT_CLASS}
        />
      )}

      {/* Arrival Details */}
      <div className="mt-8 mb-4">
        <SectionLabel>Arrival Details</SectionLabel>
      </div>
      <div className="border-t border-red-200 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="date_of_arrival" className={LABEL_CLASS}>
            Date of Arrival in the Philippines
          </Label>
          <Input
            id="date_of_arrival"
            type="date"
            value={data.date_of_arrival}
            onChange={(e) => onChange("date_of_arrival", e.target.value)}
            className={cn(INPUT_CLASS, "text-neutral-700")}
          />
        </div>
        <div>
          <Label htmlFor="exp_date_tourist_visa" className={LABEL_CLASS}>
            Expiration Date of Tourist Visa
          </Label>
          <Input
            id="exp_date_tourist_visa"
            type="date"
            value={data.exp_date_tourist_visa}
            onChange={(e) => onChange("exp_date_tourist_visa", e.target.value)}
            className={cn(INPUT_CLASS, "text-neutral-700")}
          />
        </div>
      </div>
      <div className="mb-4">
        <Label className={LABEL_CLASS}>Entry Visa Type</Label>
      </div>
      <RadioGroup
        value={data.entry_visa_type}
        onValueChange={(v) => onChange("entry_visa_type", v)}
        className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        <div className="flex items-center gap-3">
          <RadioGroupItem value="tourist" id="visa_tourist" />
          <Label htmlFor="visa_tourist" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Tourist
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="missionary" id="visa_missionary" />
          <Label htmlFor="visa_missionary" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Missionary
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="working" id="visa_working" />
          <Label htmlFor="visa_working" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Working
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="student" id="visa_student" />
          <Label htmlFor="visa_student" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Student
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="investment" id="visa_investment" />
          <Label htmlFor="visa_investment" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Investment
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="others" id="visa_others" />
          <Label htmlFor="visa_others" className="text-sm font-normal text-neutral-700 cursor-pointer">
            Others
          </Label>
        </div>
      </RadioGroup>
      {data.entry_visa_type === "others" && (
        <Input
          placeholder="Please specify"
          value={data.entry_visa_other}
          onChange={(e) => onChange("entry_visa_other", e.target.value)}
          className={cn(INPUT_CLASS, "mb-8")}
        />
      )}
    </>
  );
}