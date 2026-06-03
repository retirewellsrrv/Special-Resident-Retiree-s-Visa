import { z } from 'zod'

export const SexEnum = z.enum(['male', 'female'])
export const ClientStatusEnum = z.enum(['processing', 'approved', 'paused', 'rejected',])

export const clientProfileSchema = z.object({
    name: z.string().max(255),
    sex: SexEnum,
    birthday: z.coerce.date().transform((d) => d.toISOString()),
    nationality: z.string().max(100),
    age: z.number().int().min(0).max(32767)
})

export type ClientProfileInput = z.infer<typeof clientProfileSchema>
export type Sex = z.infer<typeof SexEnum>
export type ClientStatus = z.infer<typeof ClientStatusEnum>
