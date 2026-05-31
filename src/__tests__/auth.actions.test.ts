import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginAction, registerAction, logoutAction } from '../actions/auth'
import type { LoginInput, RegisterInput } from '../schemas/auth'

vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '../lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function mockAuth(authOverrides: Partial<{
  signInWithPassword: ReturnType<typeof vi.fn>
  signUp: ReturnType<typeof vi.fn>
  signOut: ReturnType<typeof vi.fn>
}> = {}) {
  const auth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    ...authOverrides,
  }
  vi.mocked(createClient).mockResolvedValue({ auth } as any)
  return auth
}

function mockRedirectThrows() {
  vi.mocked(redirect).mockImplementation(() => {
    throw new Error('NEXT_REDIRECT')
  })
}

describe('loginAction', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockRedirectThrows()
  })

  it('redirects an admin user to /admin/dashboard', async () => {
    mockAuth({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'admin@example.com',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      }),
    })

    const input: LoginInput = { email: 'admin@example.com', password: 'password123' }

    await expect(loginAction(input)).rejects.toThrow('NEXT_REDIRECT')

    expect(createClient).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('redirects an applicant user to /applicant/dashboard', async () => {
    mockAuth({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-456',
            email: 'applicant@example.com',
            user_metadata: { role: 'applicant' },
          },
        },
        error: null,
      }),
    })

    const input: LoginInput = { email: 'applicant@example.com', password: 'password123' }

    await expect(loginAction(input)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/applicant/dashboard')
  })

  it('redirects to / when user has no role', async () => {
    mockAuth({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-789', email: 'user@example.com', user_metadata: {} },
        },
        error: null,
      }),
    })

    const input: LoginInput = { email: 'user@example.com', password: 'password123' }

    await expect(loginAction(input)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('returns error for invalid credentials', async () => {
    mockAuth({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      }),
    })

    const input: LoginInput = { email: 'wrong@example.com', password: 'wrongpassword' }
    const result = await loginAction(input)

    expect(result).toEqual({ success: false, error: 'Invalid login credentials' })
  })

  it('returns error for missing email', async () => {
    const result = await loginAction({ email: '', password: 'password123' })
    expect(result).toEqual({ success: false, error: 'Email is required' })
  })

  it('returns error for invalid email format', async () => {
    const result = await loginAction({ email: 'not-an-email', password: 'password123' })
    expect(result).toEqual({ success: false, error: 'Enter a valid email address' })
  })

  it('returns error for missing password', async () => {
    const result = await loginAction({ email: 'test@example.com', password: '' })
    expect(result).toEqual({ success: false, error: 'Password is required' })
  })
})

describe('registerAction', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockRedirectThrows()
  })

  const baseInput: RegisterInput = {
    firstName: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    birthday: '1990-01-01',
    nationality: 'American',
    address: '123 Main St',
    phoneNumber: '1234567890',
    password: 'Password123',
    confirmPassword: 'Password123',
  }

  it('returns confirmation-email message when no session is returned', async () => {
    mockAuth({
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'new-user-123',
            email: 'jane@example.com',
            user_metadata: { name: 'Jane Smith' },
            created_at: '2024-01-01T00:00:00Z',
          },
          session: null,
        },
        error: null,
      }),
    })

    const input: RegisterInput = {
      ...baseInput,
      firstName: 'Jane',
      surname: 'Smith',
      email: 'jane@example.com',
      sex: 'female',
      nationality: 'Canadian',
      phoneNumber: '+15551234567',
    }

    const result = await registerAction(input)

    expect(result).toEqual({ success: false, error: expect.stringContaining('confirmation email') })
  })

  it('returns error for invalid email', async () => {
    const result = await registerAction({ ...baseInput, email: 'invalid-email' })
    expect(result).toEqual({ success: false, error: expect.stringContaining('valid email address') })
  })

  it('capitalises first name and surname before calling signUp', async () => {
    mockAuth({
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { name: 'John Doe' },
          },
          session: null,
        },
        error: null,
      }),
    })

    await registerAction({ ...baseInput, firstName: 'jOHN', surname: 'dOE' })

    const client = await createClient()
    expect(client.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({ name: 'John Doe' }),
        }),
      })
    )
  })

  it('handles a signUp error gracefully', async () => {
    mockAuth({
      signUp: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      }),
    })

    const result = await registerAction({ ...baseInput, email: 'duplicate@example.com' })
    expect(result).toEqual({ success: false, error: 'User already exists' })
  })

  it('returns error when signUp returns no user and no error', async () => {
    mockAuth({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
    })

    const result = await registerAction({ ...baseInput, email: 'fail@example.com' })
    expect(result).toEqual({ success: false, error: 'Failed to create account. Please try again.' })
  })

  it('returns error for missing firstName', async () => {
    const result = await registerAction({ ...baseInput, firstName: '' })
    expect(result).toEqual({ success: false, error: expect.stringContaining('First Name is required') })
  })

  it('returns error for missing surname', async () => {
    const result = await registerAction({ ...baseInput, surname: '' })
    expect(result).toEqual({ success: false, error: expect.stringContaining('surname is required') })
  })

  it('returns error for missing phoneNumber', async () => {
    const result = await registerAction({ ...baseInput, phoneNumber: '' })
    expect(result).toEqual({ success: false, error: expect.stringContaining('Phone number is required') })
  })
})

describe('logoutAction', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockRedirectThrows()
  })

  it('signs out, revalidates layout, and redirects to /login', async () => {
    mockAuth({
      signOut: vi.fn().mockResolvedValue({ error: null }),
    })

    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT')

    expect(createClient).toHaveBeenCalledTimes(1)
    const client = await createClient()
    expect(client.auth.signOut).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
