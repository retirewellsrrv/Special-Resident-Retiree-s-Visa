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

const educationEntrySchema = z.object({
  id: z.string().optional(),
  educ_attainment: z.string(),
  school: z.string(),
  location: z.string(),
  from_date: z.string(),
  to_date: z.string(),
}).refine(
  (data) => {
    const values = [data.educ_attainment, data.school, data.location, data.from_date, data.to_date];
    const filled = values.filter((v) => v?.trim().length > 0).length;
    return filled === 0 || filled === 5;
  },
  {
    message: "All fields in this row must be filled",
  },
).refine(
  (data) => {
    if (!data.from_date || !data.to_date) return true;
    return data.from_date < data.to_date;
  },
  {
    message: "From date must be before to date",
    path: ["from_date"],
  },
).refine(
  (data) => {
    if (!data.to_date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.to_date) < today;
  },
  {
    message: "To date cannot be in the future",
    path: ["to_date"],
  },
);

const employmentEntrySchema = z.object({
  id: z.string().optional(),
  company_name: z.string(),
  job_title: z.string(),
  contact_no: z.string(),
  company_address: z.string(),
  from_date: z.string(),
  to_date: z.string(),
}).refine(
  (data) => {
    const values = [data.company_name, data.job_title, data.contact_no, data.company_address, data.from_date];
    const filled = values.filter((v) => v?.trim().length > 0).length;
    return filled === 0 || filled === 5;
  },
  {
    message: "All fields in this row must be filled",
  },
).refine(
  (data) => {
    if (!data.from_date || !data.to_date) return true;
    return data.from_date < data.to_date;
  },
  {
    message: "From date must be before to date",
    path: ["from_date"],
  },
).refine(
  (data) => {
    if (!data.to_date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.to_date) < today;
  },
  {
    message: "To date cannot be in the future",
    path: ["to_date"],
  },
);

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
    .min(1, "Passport number is required")
    .regex(/^[A-Z0-9]{5,20}$/, "Invalid passport number format"),
  passport_place_of_issue: z
    .string()
    .min(1, "Place of issue is required")
    .regex(/^[^\d]*$/, "Place of issue must not contain numbers"),
  passport_date_of_issue: z
    .string()
    .min(1, "Date of issue is required"),
  passport_valid_until: z
    .string()
    .min(1, "Passport validity is required")
    .refine((val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(val) > today;
    }, "Passport is expired or expires today"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email address is too long"),
  mobile_number: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\d{10,15}$/, "Invalid mobile number"),
  telephone_number: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^\d{7,15}$/.test(val),
      "Invalid telephone number",
    ),
  fax_number: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^\d{7,15}$/.test(val),
      "Invalid fax number",
    ),
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
    id: z.string().optional(),
    full_name: z.string(),
    relationship: z.string(),
    age: z.string(),
    passport_no: z.string().refine(
      (val) => val === "" || /^[A-Z0-9]{5,20}$/.test(val),
      "Invalid passport number format",
    ),
    include: z.boolean(),
  }).refine(
    (data) => {
      const values = [data.full_name, data.relationship, data.age, data.passport_no];
      const filled = values.filter((v) => v?.trim().length > 0).length;
      return filled === 0 || filled === 4;
    },
    {
      message: "All fields in this row must be filled",
    },
  )).default([]),
  educations: z.array(educationEntrySchema).default([]),
  employments: z.array(employmentEntrySchema).default([]),
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
  emergency_phone: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || /^\d{7,15}$/.test(val),
      "Invalid phone number",
    ),
  future_plan: z.string().min(1, "Future plan is required"),
  future_plan_other: z.string().optional().default(""),
  entry_visa_type: z.string().optional().default(""),
  entry_visa_other: z.string().optional().default(""),
  date_of_arrival: z.string().optional().default(""),
  exp_date_tourist_visa: z.string().optional().default(""),
}).refine(
  (data) => {
    if (!data.passport_date_of_issue || !data.passport_valid_until) return true;
    return data.passport_date_of_issue < data.passport_valid_until;
  },
  {
    message: "Date of issue must be before valid until date",
    path: ["passport_date_of_issue"],
  },
).refine(
  (data) => {
    if (data.future_plan !== "others") return true;
    return data.future_plan_other?.trim().length > 0;
  },
  {
    message: "Please specify your future plans",
    path: ["future_plan_other"],
  },
).refine(
  (data) => {
    if (data.entry_visa_type !== "others") return true;
    return data.entry_visa_other?.trim().length > 0;
  },
  {
    message: "Please specify your entry visa type",
    path: ["entry_visa_other"],
  },
).refine(
  (data) => {
    if (!data.date_of_arrival) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.date_of_arrival) >= today;
  },
  {
    message: "Date of arrival cannot be in the past",
    path: ["date_of_arrival"],
  },
).refine(
  (data) => {
    if (!data.exp_date_tourist_visa) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.exp_date_tourist_visa) > today;
  },
  {
    message: "Tourist visa has expired",
    path: ["exp_date_tourist_visa"],
  },
);

export type ApplicationInsertInput = z.infer<typeof applicationInsertSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export type FuturePlan = z.infer<typeof FuturePlanEnum>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;
