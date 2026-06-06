import { z } from "zod";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const ServiceTypeEnum = z.enum(["basic", "premium", "vip"], {
  error: "Please select a valid service type: Basic, Premium, or VIP",
});
export const ApplicationStatusEnum = z.enum([
  "processing",
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
  city: z.string(),
  country: z.string(),
  created_at: z.string().optional(),
  emergency_name: z.string().optional().nullable(),
  emergency_phone: z.string().optional().nullable(),
  emergency_relationship: z.string().optional().nullable(),
  id: z.number().optional(),
  payment_id: z.number(),
  ph_address: z.string().optional().nullable(),
  phone_number: z.string(),
  service_type: ServiceTypeEnum,
  state: z.string(),
  status: ApplicationStatusEnum.optional(),
  street: z.string(),
  updated_at: z.string().optional().nullable(),
  user_id: z.string(),
  zip: z.string(),
});

export const applicationUpdateSchema = applicationInsertSchema
  .omit({ id: true, created_at: true, application_code: true })
  .partial();

// ─────────────────────────────────────────────
// APPLICATION FORM SCHEMA (Multi-step form)
// ─────────────────────────────────────────────

export const applicationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z
    .string()
    .min(1, "Birthday is required")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }, "Birthday must be valid"),
  sex: z.enum(["male", "female"], {
    error: "Please select a valid sex",
  }),
  nationality: z.string().min(1, "Nationality is required"),
  marital_status: z.string().min(1, "Marital status is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email address is too long"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{6,14}$/, { message: "Invalid phone number format" }),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zip: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  ph_address: z.string().nullable(),
  emergency_name: z.string().nullable(),
  emergency_relationship: z.string().nullable(),
  emergency_phone: z.string().nullable(),
  service_type: ServiceTypeEnum,
});

export type ApplicationInsertInput = z.infer<typeof applicationInsertSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export type ServiceType = z.infer<typeof ServiceTypeEnum>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;
