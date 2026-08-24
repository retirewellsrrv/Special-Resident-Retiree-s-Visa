import { z } from 'zod'

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First Name is required')
      .min(2, 'First name must be at least 2 characters')
      .regex(/^[^\d]*$/, 'First name must not contain numbers'),
    suffix: z
      .string()
      .optional(),
    surname: z
      .string()
      .min(1, 'surname is required')
      .min(2, 'Surname must be at least 2 characters')
      .regex(/^[^\d]*$/, 'Surname must not contain numbers'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    sex: z
      .enum(['male', 'female'])
      .optional(),
    birthday: z
      .string()
      .min(1, 'Birthday is required'),
    age: z
      .int()
      .optional(),
    nationality: z
      .string(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>