import { z } from 'zod'

export const createInvoiceSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
  payerEmail: z.string().email().optional(),
  successRedirectUrl: z.string().url().optional(),
  failureRedirectUrl: z.string().url().optional(),
  paymentMethods: z.array(z.string()).optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
