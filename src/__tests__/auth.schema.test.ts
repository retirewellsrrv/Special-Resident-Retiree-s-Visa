import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from '../schemas/auth'

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const input: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    }
    const result = loginSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject missing email', () => {
    const input: LoginInput = {
      email: '',
      password: 'password123',
    }
    const result = loginSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required')
    }
  })

  it('should reject invalid email format', () => {
    const input: LoginInput = {
      email: 'invalid-email',
      password: 'password123',
    }
    const result = loginSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter a valid email address')
    }
  })

  it('should reject missing password', () => {
    const input: LoginInput = {
      email: 'test@example.com',
      password: '',
    }
    const result = loginSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required')
    }
  })
})

describe('registerSchema', () => {
  const validRegisterInput: RegisterInput = {
    firstName: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    sex: 'male',
    birthday: '1990-01-15',
    nationality: 'American',
    address: '123 Main St',
    phoneNumber: '+1234567890',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
  }

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validRegisterInput)
    expect(result.success).toBe(true)
  })

  it('should reject missing firstName', () => {
    const result = registerSchema.safeParse({ ...validRegisterInput, firstName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('First Name is required')
    }
  })

  it('should reject firstName with less than 2 characters', () => {
    const input = { ...validRegisterInput, firstName: 'J' }
    const result = registerSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2 characters')
    }
  })

  it('should reject missing surname', () => {
    const result = registerSchema.safeParse({ ...validRegisterInput, surname: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('surname is required')
    }
  })

  it('should reject invalid email', () => {
    const input = { ...validRegisterInput, email: 'not-an-email' }
    const result = registerSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should reject invalid sex enum value', () => {
    const input = { ...validRegisterInput, sex: 'other' as const }
    const result = registerSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should accept optional sex field', () => {
    const { sex, ...rest } = validRegisterInput
    const result = registerSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it('should reject short password', () => {
    const input = { ...validRegisterInput, password: '12345' }
    const result = registerSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 8 characters')
    }
  })

  it('should reject mismatched passwords', () => {
    const input = {
      ...validRegisterInput,
      confirmPassword: 'DifferentPassword123',
    }
    const result = registerSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match')
    }
  })

  it('should accept missing optional age field', () => {
    const { age, ...rest } = validRegisterInput
    const result = registerSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('should validate correct email', () => {
    const input = { email: 'test@example.com' }
    const result = forgotPasswordSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject missing email', () => {
    const input = { email: '' }
    const result = forgotPasswordSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email format', () => {
    const input = { email: 'invalid' }
    const result = forgotPasswordSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  const validInput = {
    password: 'NewStrongPassword123',
    confirmPassword: 'NewStrongPassword123',
  }

  it('should validate matching passwords', () => {
    const result = resetPasswordSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject short password', () => {
    const input = { password: '12345', confirmPassword: '12345' }
    const result = resetPasswordSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should reject mismatched passwords', () => {
    const input = {
      password: 'Password123',
      confirmPassword: 'DifferentPassword123',
    }
    const result = resetPasswordSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match')
    }
  })

  it('should reject missing confirmPassword', () => {
    const { confirmPassword, ...rest } = validInput
    const result = resetPasswordSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
