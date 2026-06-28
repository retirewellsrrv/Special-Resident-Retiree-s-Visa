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
  ["passport", "visa", "nbi", "pension", "medical"],
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
    file: z.instanceof(File, { message: "Passport bio page is required" }),
    name: z.string(),
  }),
  visa: z.object({
    file: z.instanceof(File, { message: "Valid visa page is required" }),
    name: z.string(),
  }),
  nbi: z.object({
    file: z.instanceof(File, {
      message: "NBI or police clearance is required",
    }),
    name: z.string(),
  }),
  pension: z.object({
    file: z.instanceof(File, {
      message: "Pension or bank certification is required",
    }),
    name: z.string(),
  }),
  medical: z.object({
    file: z.instanceof(File, {
      message: "Medical examination report is required",
    }),
    name: z.string(),
  }),
});

export type Step4FormInput = z.infer<typeof step4FormSchema>;

export type DocumentFormat = z.infer<typeof DocumentFormatEnum>;
export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;
export type DocumentType = z.infer<typeof DocumentTypeEnum>;
