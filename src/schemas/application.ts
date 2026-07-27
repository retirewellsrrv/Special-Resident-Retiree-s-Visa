import { z } from "zod";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const FuturePlanEnum = z.enum(["tourism", "investment", "employment", "others"], {
  error: "Please select a valid future plan: Tourism, Investment, Employment, or Others",
});
export const ApplicationStatusEnum = z.enum([
  "paused",
  "approved",
  "rejected",
  "pending",
]);

// ─────────────────────────────────────────────
// APPLICATION SCHEMAS (Database operations)
// ─────────────────────────────────────────────

export const applicationInsertSchema = z.object({
  application_code: z.string(),
  created_at: z.string().optional(),
  future_plans: FuturePlanEnum.optional(),
  id: z.number().optional(),
  payment_id: z.number().optional().nullable(),
  status: ApplicationStatusEnum.optional(),
  updated_at: z.string().optional().nullable(),
  user_id: z.string(),
});

export const applicationUpdateSchema = applicationInsertSchema
  .omit({ id: true, created_at: true, application_code: true })
  .partial();

// ─────────────────────────────────────────────
// APPLICATION FORM SCHEMA (Multi-step form)
// ─────────────────────────────────────────────

export const applicationFormSchema = z.object({
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[^\d]*$/, "Last name must not contain numbers"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(/^[^\d]*$/, "First name must not contain numbers"),
  middle_name: z.string().optional().default(""),
  birthday: z
    .string()
    .min(1, "Birthday is required")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }, "Birthday must be valid"),
  place_of_birth: z
    .string()
    .min(1, "Place of birth is required"),
  sex: z.enum(["male", "female"], {
    error: "Please select a valid gender",
  }),
  religion: z
    .string()
    .min(1, "Religion is required"),
  nationality: z
    .string()
    .min(1, "Citizenship is required")
    .regex(/^[^\d]*$/, "Citizenship must not contain numbers"),
  marital_status: z.string().min(1, "Civil status is required"),
  height: z
    .string()
    .min(1, "Height is required"),
  weight: z
    .string()
    .min(1, "Weight is required"),
  passport_number: z
    .string()
    .min(1, "Passport number is required"),
  passport_place_of_issue: z
    .string()
    .min(1, "Place of issue is required"),
  passport_date_of_issue: z
    .string()
    .min(1, "Date of issue is required"),
  passport_valid_until: z
    .string()
    .min(1, "Passport validity is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email address is too long"),
  mobile_number: z
    .string()
    .min(1, "Mobile number is required"),
  telephone_number: z.string().nullable(),
  fax_number: z.string().nullable(),
  home_country_address: z
    .string()
    .min(1, "Home country address is required"),
  ph_primary_address: z.string().nullable(),
  ph_secondary_address: z.string().nullable(),
  father_name: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^[^\d]*$/.test(val),
      "Father name must not contain numbers",
    ),
  father_age: z.string().nullable(),
  mother_name: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^[^\d]*$/.test(val),
      "Mother name must not contain numbers",
    ),
  mother_age: z.string().nullable(),
  family_members: z.array(z.object({
    id: z.string(),
    full_name: z.string(),
    relationship: z.string(),
    age: z.string(),
    passport_no: z.string(),
    include: z.boolean(),
  })).default([]),
  emergency_name: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^[^\d]*$/.test(val),
      "Emergency contact name must not contain numbers",
    ),
  emergency_relationship: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^[^\d]*$/.test(val),
      "Relationship must not contain numbers",
    ),
  emergency_phone: z.string().nullable(),
  future_plan: z.string().min(1, "Future plan is required"),
});

export type ApplicationInsertInput = z.infer<typeof applicationInsertSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export type FuturePlan = z.infer<typeof FuturePlanEnum>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;
