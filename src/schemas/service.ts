import { z } from 'zod'

export const serviceSchema = z.object({
  type: z.enum(['basic', 'premium', 'vip']),

  price: z.coerce.number().positive(),

  description: z
    .string()
    .max(500)
    .nullable(),

  is_available: z.boolean().default(true),
})

export const updateServiceSchema =
  serviceSchema.partial()

export type ServiceInput = z.infer<
  typeof serviceSchema
>

export type UpdateServiceInput = z.infer<
  typeof updateServiceSchema
>