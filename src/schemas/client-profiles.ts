import { z } from 'zod'

export const SexEnum = z.enum(['male', 'female'])
export const ApplicationStatusEnum = z.enum([
  'processing', 'paused', 'approved', 'rejected',
])
export const ServiceTypeEnum = z.enum(['basic', 'premium', 'vip'])

export const clientProfileSchema = z.object({
  name: z.string().max(255),
  sex: SexEnum,
  birthday: z.coerce.date().transform((d) => d.toISOString()),
  nationality: z.string().max(100),
  age: z.number().int().min(0).max(32767).optional(),
})

export type ClientProfileInput = z.infer<typeof clientProfileSchema>
export type Sex = z.infer<typeof SexEnum>
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>
export type ServiceType = z.infer<typeof ServiceTypeEnum>
