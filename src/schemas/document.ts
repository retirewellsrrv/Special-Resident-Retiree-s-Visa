import { z } from "zod";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const DocumentFormatEnum = z.enum(
  [
    "pdf",
    "doc",
    "docx",
    "jpg",
    "png",
    "gif",
    "bmp",
    "webp",
    "tiff",
    "tif",
    "jpeg",
  ],
  {
    error: "Please select a valid document format",
  },
);

export const DocumentStatusEnum = z.enum(
  ["pending", "processing", "accepted", "rejected", "action need"],
  {
    error: "Please select a valid document status",
  },
);

export const DocumentTypeEnum = z.enum(
  ["passport", "photo_2x2", "pra_application", "medical", "police", "bicc", "bank_cert", "proof_payment", "proof_pension", "proof_relationship"],
  {
    error: "Please select a valid document type",
  },
);

// ─────────────────────────────────────────────
// DOCUMENT SCHEMAS (Database operations)
// ─────────────────────────────────────────────

export const documentInsertSchema = z.object({
  application_id: z.number(),
  created_at: z.string().optional(),
  format: DocumentFormatEnum,
  id: z.number().optional(),
  name: z.string(),
  path: z.string(),
  status: DocumentStatusEnum.optional(),
  review_note: z.string().optional().nullable(),
  type: DocumentTypeEnum,
  updated_at: z.string().optional().nullable(),
});

export const documentUpdateSchema = documentInsertSchema
  .omit({ id: true, created_at: true })
  .partial();

export const documentRowSchema = documentInsertSchema.omit({
  created_at: true,
  updated_at: true,
});

// ─────────────────────────────────────────────
// TYPE INFERENCES
// ─────────────────────────────────────────────

export type DocumentInsertInput = z.infer<typeof documentInsertSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type DocumentRow = z.infer<typeof documentRowSchema>;

// ─────────────────────────────────────────────
// STEP 4 FORM SCHEMA (Client-side file validation)
// ─────────────────────────────────────────────

export const step4FormSchema = z.object({
  passport: z.object({
    file: z.instanceof(File, { message: "Passport is required" }),
    name: z.string(),
  }),
  photo_2x2: z.object({
    file: z.instanceof(File, { message: "2x2 photo is required" }),
    name: z.string(),
  }),
  medical: z.object({
    file: z.instanceof(File, {
      message: "Medical certificate is required",
    }),
    name: z.string(),
  }),
  police: z.object({
    file: z.instanceof(File, { message: "Police clearance is required" }),
    name: z.string(),
  }),
  bicc: z.object({
    file: z.instanceof(File, { message: "BICC document is required" }),
    name: z.string(),
  }),
  bank_cert: z.object({
    file: z.instanceof(File, { message: "Bank certification is required" }),
    name: z.string(),
  }),
  proof_payment: z.object({
    file: z.instanceof(File, { message: "Proof of payment is required" }),
    name: z.string(),
  }),
});

export type Step4FormInput = z.infer<typeof step4FormSchema>;

export type DocumentFormat = z.infer<typeof DocumentFormatEnum>;
export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;
export type DocumentType = z.infer<typeof DocumentTypeEnum>;
