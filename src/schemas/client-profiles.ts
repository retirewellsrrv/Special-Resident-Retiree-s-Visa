import { z } from 'zod'

export const GenderEnum = z.enum(['male', 'female', 'other', 'prefer_not'])
export const ApplicationStatusEnum = z.enum([
  'draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected',
])
export const ServiceTypeEnum = z.enum(['basic', 'premium', 'vip'])

export const clientProfileSchema = z.object({
  name: z.string().max(255),
  gender: GenderEnum,
  birthday: z.coerce.date().transform((d) => d.toISOString()),
  nationality: z.string().max(100),
  age: z.number().int().min(0).max(32767).optional(),
})

export type ClientProfileInput = z.infer<typeof clientProfileSchema>
export type Gender = z.infer<typeof GenderEnum>
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>
export type ServiceType = z.infer<typeof ServiceTypeEnum>
