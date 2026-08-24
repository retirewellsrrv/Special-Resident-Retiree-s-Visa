import { z } from 'zod'

export const SexEnum = z.enum(['male', 'female'])
export const MaritalStatusEnum = z.enum(['single', 'married', 'widowed', 'divorced'])
export const ApplicationStatusEnum = z.enum([
  'paused', 'pending', 'processing', 'approved', 'rejected', 'payment_failed',
])
export const ServiceTypeEnum = z.enum(['basic', 'premium', 'vip'])

export const clientProfileSchema = z.object({
  name: z
    .string()
    .max(255)
    .regex(/^[^\d]*$/, "Name must not contain numbers"),
  sex: SexEnum,
  birthday: z.coerce.date().transform((d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }),
  nationality: z
    .string()
    .max(100)
    .regex(/^[^\d]*$/, "Nationality must not contain numbers"),
  age: z.number().int().min(0).max(32767).optional(),
  marital_status: MaritalStatusEnum.optional(),
})

export type ClientProfileInput = z.infer<typeof clientProfileSchema>
export type Sex = z.infer<typeof SexEnum>
export type MaritalStatus = z.infer<typeof MaritalStatusEnum>
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>
export type ServiceType = z.infer<typeof ServiceTypeEnum>
