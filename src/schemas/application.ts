import { z } from 'zod'

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  maritalStatus: z.string().min(1, 'Marital status is required'),
})

export const contactInfoSchema = z.object({
  email: z.string().email('Valid email is required'),
  phoneCode: z.string().min(1),
  phone: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phAddress: z.string().optional().default(''),
  ecName: z.string().min(1, 'Emergency contact name is required'),
  ecRelationship: z.string().min(1, 'Relationship is required'),
  ecPhone: z.string().min(1, 'Emergency phone is required'),
})

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type ContactInfoInput = z.infer<typeof contactInfoSchema>
