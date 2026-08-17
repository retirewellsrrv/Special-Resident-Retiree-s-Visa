/**
 * Shared metadata helpers for the document review workspace.
 *
 * The label map intentionally covers the real `DocumentTypeEnum` values
 * (src/schemas/document.ts) while keeping legacy aliases ("visa", "nbi",
 * "pension") that may exist in older rows. Unknown types fall back to the
 * raw stored value so nothing renders blank.
 */

export const DOC_TYPE_LABELS: Record<string, string> = {
  // Current DocumentTypeEnum values
  passport: 'Passport',
  photo_2x2: '2x2 Photo',
  pra_application: 'PRA Application',
  medical: 'Medical Certificate',
  police: 'Police Clearance',
  bicc: 'BICC',
  bank_cert: 'Bank Certification',
  proof_payment: 'Proof of Payment',
  proof_pension: 'Proof of Pension',
  proof_relationship: 'Proof of Relationship',
  // Legacy aliases that may still appear in older rows
  visa: 'Visa',
  nbi: 'NBI Clearance',
  pension: 'Pension Proof',
}

export function documentTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] ?? type
}

/**
 * Minimal document shape the review workspace components depend on.
 * Both `DocumentForReview` (documents queue) and `AppDetail['documents'][number]`
 * (application detail) satisfy it, so the same components can be reused in
 * both contexts.
 */
export type ReviewableDocument = {
  id: number
  name: string
  path: string
  type: string
  format: string
  status: string
  review_note: string | null
  created_at: string
  /** Present when loaded from the documents queue; absent in the app-detail context */
  applicant_name?: string
  application_code?: string
}
