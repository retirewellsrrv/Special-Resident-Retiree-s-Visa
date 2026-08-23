import { FileText, FileImage, FileBadge, ShieldCheck, Banknote, Stethoscope, Receipt, PiggyBank, Users, Plane, Fingerprint } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Single source of truth for document type labels/icons across the admin
 * review surfaces (review queue, viewer, review modal).
 */
export const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  photo_2x2: '2x2 Photo',
  pra_application: 'PRA Application Form',
  medical: 'Medical Report',
  police: 'Police Clearance',
  bicc: 'BI Clearance (BICC)',
  bank_cert: 'Bank Certificate',
  proof_payment: 'Processing & Fees',
  proof_pension: 'Proof of Pension',
  proof_relationship: 'Proof of Relationship',
  visa: 'Visa',
  nbi: 'NBI Clearance',
  pension: 'Pension Proof',
}

export const DOC_TYPE_ICONS: Record<string, LucideIcon> = {
  passport: FileBadge,
  photo_2x2: FileImage,
  pra_application: FileText,
  medical: Stethoscope,
  police: ShieldCheck,
  bicc: ShieldCheck,
  bank_cert: Banknote,
  proof_payment: Receipt,
  proof_pension: PiggyBank,
  proof_relationship: Users,
  visa: Plane,
  nbi: Fingerprint,
  pension: PiggyBank,
}

export function documentTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
}
