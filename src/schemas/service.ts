import { z } from 'zod'

export const servicePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  subtitle: z.string().min(1, 'Subtitle is required').max(200),
  price: z.coerce
    .number()
    .positive()
    .multipleOf(0.01, 'Max 2 decimal places'),
  price_note: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val ?? null)),
  description: z.string().min(1, 'Description is required').max(2000),
  tags: z.array(z.string()).default([]),
  highlighted: z.boolean().default(false),
  is_available: z.boolean().default(true),
})

export const updateServicePlanSchema = servicePlanSchema.partial()

export type ServicePlanInput = z.infer<typeof servicePlanSchema>
export type UpdateServicePlanInput = z.infer<typeof updateServicePlanSchema>