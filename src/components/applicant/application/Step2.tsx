"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";
import { INPUT_CLASS, LABEL_CLASS } from "./constants";

export type FamilyMember = {
  id: string;
  full_name: string;
  relationship: string;
  age: string;
  passport_no: string;
  include: boolean;
};

type Step2Data = {
  home_country_address: string;
  ph_primary_address: string;
  ph_secondary_address: string;
  telephone_number: string;
  fax_number: string;
  mobile_number: string;
  email: string;
  father_name: string;
  father_age: string;
  mother_name: string;
  mother_age: string;
  family_members: FamilyMember[];
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
};

type Step2Field = keyof Step2Data;
type Step2Value<F extends Step2Field> = Step2Data[F];

export function Step2({
  data,
  onChange,
  errors = {},
}: {
  data: Step2Data;
  onChange: <F extends Step2Field>(field: F, value: Step2Value<F>) => void;
  errors?: Record<string, string>;
}) {
  const addFamilyMember = () => {
    const next: FamilyMember = {
      id: crypto.randomUUID(),
      full_name: "",
      relationship: "",
      age: "",
      passport_no: "",
      include: true,
    };
    onChange("family_members", [...data.family_members, next]);
  };

  const updateFamilyMember = (
    id: string,
    field: keyof FamilyMember,
    value: string | boolean,
  ) => {
    onChange(
      "family_members",
      data.family_members.map((m) =>
        m.id === id ? { ...m, [field]: value } : m,
      ),
    );
  };

  const removeFamilyMember = (id: string) => {
    onChange(
      "family_members",
      data.family_members.filter((m) => m.id !== id),
    );
  };

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

      {/* Addresses */}
      <SectionLabel>Addresses</SectionLabel>
      <div className="mb-6">
        <Label htmlFor="home_country_address" className={LABEL_CLASS}>
          Home Country Address (Please specify)
        </Label>
        <Textarea
          id="home_country_address"
          placeholder="Enter full permanent address in your home country"
          value={data.home_country_address}
          onChange={(e) => onChange("home_country_address", e.target.value)}
          className={cn(
            INPUT_CLASS,
            "min-h-[44px]",
            errors.home_country_address && "border-red-500",
          )}
        />
        {errors.home_country_address && (
          <p className="text-sm text-red-500 mt-1">
            {errors.home_country_address}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="ph_primary_address" className={LABEL_CLASS}>
          Primary Address in the Philippines (Please specify)
        </Label>
        <Textarea
          id="ph_primary_address"
          placeholder="Enter your intended primary residence or hotel in the Philippines"
          value={data.ph_primary_address}
          onChange={(e) => onChange("ph_primary_address", e.target.value)}
          className={cn(
            INPUT_CLASS,
            "min-h-[44px]",
            errors.ph_primary_address && "border-red-500",
          )}
        />
        {errors.ph_primary_address && (
          <p className="text-sm text-red-500 mt-1">
            {errors.ph_primary_address}
          </p>
        )}
      </div>

      <div className="mb-8">
        <Label htmlFor="ph_secondary_address" className={LABEL_CLASS}>
          Secondary Address in the Philippines (Please specify)
        </Label>
        <Textarea
          id="ph_secondary_address"
          placeholder="Enter secondary residence, vacation home, or temporary stay address"
          value={data.ph_secondary_address}
          onChange={(e) => onChange("ph_secondary_address", e.target.value)}
          className={cn(INPUT_CLASS, "min-h-[44px]")}
        />
      </div>

      {/* Communication */}
      <SectionLabel>Communication</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="telephone_number" className={LABEL_CLASS}>
            Telephone Number
          </Label>
          <Input
            id="telephone_number"
            type="tel"
            placeholder="Include country and area code"
            value={data.telephone_number}
            onChange={(e) => onChange("telephone_number", e.target.value)}
            className={cn(
              INPUT_CLASS,
              errors.telephone_number && "border-red-500",
            )}
          />
          {errors.telephone_number && (
            <p className="text-sm text-red-500 mt-1">
              {errors.telephone_number}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="fax_number" className={LABEL_CLASS}>
            Fax Number
          </Label>
          <Input
            id="fax_number"
            type="tel"
            placeholder="Include country and area code"
            value={data.fax_number}
            onChange={(e) => onChange("fax_number", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="mobile_number" className={LABEL_CLASS}>
            Mobile Number
          </Label>
          <Input
            id="mobile_number"
            type="tel"
            placeholder="Include country code"
            value={data.mobile_number}
            onChange={(e) => onChange("mobile_number", e.target.value)}
            className={cn(
              INPUT_CLASS,
              errors.mobile_number && "border-red-500",
            )}
          />
          {errors.mobile_number && (
            <p className="text-sm text-red-500 mt-1">
              {errors.mobile_number}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className={LABEL_CLASS}>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. name@example.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(INPUT_CLASS, errors.email && "border-red-500")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Parents' Information */}
      <SectionLabel>Parents&apos; Information</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 mb-6">
        <div>
          <Label htmlFor="father_name" className={LABEL_CLASS}>
            Name of Father
          </Label>
          <Input
            id="father_name"
            placeholder="Full legal name"
            value={data.father_name}
            onChange={(e) => onChange("father_name", e.target.value.replace(/[0-9]/g, ""))}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label htmlFor="father_age" className={LABEL_CLASS}>
            Age
          </Label>
          <Input
            id="father_age"
            type="number"
            inputMode="numeric"
            placeholder="Years"
            value={data.father_age}
            onChange={(e) => onChange("father_age", e.target.value.replace(/[^0-9]/g, ""))}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 mb-8">
        <div>
          <Label htmlFor="mother_name" className={LABEL_CLASS}>
            Name of Mother
          </Label>
          <Input
            id="mother_name"
            placeholder="Full legal name"
            value={data.mother_name}
            onChange={(e) => onChange("mother_name", e.target.value.replace(/[0-9]/g, ""))}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label htmlFor="mother_age" className={LABEL_CLASS}>
            Age
          </Label>
          <Input
            id="mother_age"
            type="number"
            inputMode="numeric"
            placeholder="Years"
            value={data.mother_age}
            onChange={(e) => onChange("mother_age", e.target.value.replace(/[^0-9]/g, ""))}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Family Member Information */}
      <SectionLabel>
        Family Member Information (Accompanying Dependents)
      </SectionLabel>
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="font-medium py-2 pr-3">Full Legal Name</th>
              <th className="font-medium py-2 pr-3">Relationship</th>
              <th className="font-medium py-2 pr-3 w-20">Age</th>
              <th className="font-medium py-2 pr-3">Passport No.</th>
              <th className="font-medium py-2 pr-3 w-16 text-center">
                Include?
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {data.family_members.map((member) => (
              <tr key={member.id} className="border-b border-neutral-100">
                <td className="py-2 pr-3">
                  <Input
                    placeholder="Enter name"
                    value={member.full_name}
                    onChange={(e) =>
                      updateFamilyMember(member.id, "full_name", e.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="e.g. Spouse, Child"
                    value={member.relationship}
                    onChange={(e) =>
                      updateFamilyMember(
                        member.id,
                        "relationship",
                        e.target.value,
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Years"
                    value={member.age}
                    onChange={(e) =>
                      updateFamilyMember(
                        member.id,
                        "age",
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    placeholder="Passport No."
                    value={member.passport_no}
                    onChange={(e) =>
                      updateFamilyMember(
                        member.id,
                        "passport_no",
                        e.target.value,
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </td>
                <td className="py-2 pr-3 text-center">
                  <Checkbox
                    checked={member.include}
                    onCheckedChange={(checked) =>
                      updateFamilyMember(member.id, "include", checked === true)
                    }
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(member.id)}
                    className="text-neutral-400 hover:text-red-500"
                    aria-label="Remove family member"
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
        onClick={addFamilyMember}
        className="mb-8 text-sm text-neutral-600 hover:text-neutral-900 px-0"
      >
        <Plus size={16} className="mr-1" />
        Add another family member
      </Button>

      {/* Emergency Contact */}
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
              onChange={(e) =>
                onChange("emergency_name", e.target.value.replace(/[0-9]/g, ""))
              }
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
                onChange(
                  "emergency_relationship",
                  e.target.value.replace(/[0-9]/g, ""),
                )
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
            <p className="text-sm text-red-500 mt-1">
              {errors.emergency_phone}
            </p>
          )}
        </div>
      </div>
    </>
  );
}