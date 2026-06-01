import { z } from 'zod'

export const serviceSchema = z.object({
  type: z.enum(['basic', 'premium', 'vip']),

  price: z.coerce
    .number()
    .positive()
    .multipleOf(0.01, 'Max 2 decimal places'),

  description: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val ?? null)),

  is_available: z.boolean().default(true),
})

export const updateServiceSchema = serviceSchema
  .omit({ is_available: true })
  .partial()

export type ServiceInput = z.infer<typeof serviceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>