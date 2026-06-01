'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Provider } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/client'


import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/schemas/auth'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string }

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const role = data.user?.user_metadata?.role as string | undefined

  revalidatePath('/', 'layout')

  if (role === 'admin') redirect('/admin/dashboard')
  if (role === 'applicant') redirect('/applicant/dashboard')

  redirect('/')
}

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const firstName = capitalize(parsed.data?.firstName);
  const surname = capitalize(parsed.data?.surname);
  const fullName = `${firstName} ${surname}`; // capitalize first leetter and combine firsname and lastname 
  console.log(fullName)
  console.log(parsed.data.email)
  console.log(parsed.data.birthday)

  // check user if existing first
  const { data: userData, error: userDataError } = await supabaseAdmin().auth.admin.listUsers()

  if (userDataError) {
    console.error('Error fetching users:', userDataError)
    return { success: false, error: 'An error occurred while checking existing users.' }
  }

  const existingUser = userData.users.find(
    (user) => user.email?.toLowerCase() === parsed.data?.email
  )

  if (existingUser) {
    if (existingUser.email_confirmed_at) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }
    return {
      success: false,
      error:
        'This email is already registered but has not been confirmed yet. Please check your inbox.',
    }
  }

  // if no existing user, proceed to sign up
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      data: {
        role: 'applicant',
        name: fullName,
        sex: parsed.data.sex,
        birthday: parsed.data.birthday,
        nationality: parsed.data.nationality,
        age: 25,
        address: parsed.data.address,
      },
    },
  })

  if (signUpError) {
    console.error('signup error:', signUpError)
    return { success: false, error: signUpError.message }
  }

  console.log('signUp data:', JSON.stringify(data, null, 2))
  console.log('signUp error:', signUpError)

  revalidatePath('/', 'layout')
  redirect('/confirm-email')
}

// ─────────────────────────────────────────────
// Create Admin
// ─────────────────────────────────────────────


export async function CreateAdminAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const firstName = capitalize(parsed.data?.firstName);
  const surname = capitalize(parsed.data?.surname);
  const fullName = `${firstName} ${surname}`; // capitalize first leetter and combine firsname and lastname 
  console.log(fullName)
  console.log(parsed.data.email)
  console.log(parsed.data.birthday)

  // check user if existing first
  const { data: userData, error: userDataError } = await supabaseAdmin().auth.admin.listUsers()

  if (userDataError) {
    console.error('Error fetching users:', userDataError)
    return { success: false, error: 'An error occurred while checking existing users.' }
  }

  const existingUser = userData.users.find(
    (user) => user.email?.toLowerCase() === parsed.data?.email
  )

  if (existingUser) {
    if (existingUser.email_confirmed_at) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }
    return {
      success: false,
      error:
        'This email is already registered but has not been confirmed yet. Please check your inbox.',
    }
  }

  // if no existing user, proceed to sign up
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      data: {
        role: 'admin',
        name: fullName,
      },
    },
  })

  if (signUpError) {
    console.error('signup error:', signUpError)
    return { success: false, error: signUpError.message }
  }

  console.log('signUp data:', JSON.stringify(data, null, 2))
  console.log('signUp error:', signUpError)

  revalidatePath('/', 'layout')
  redirect('/confirm-email')
}


export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────

export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password reset link sent. Check your email.' }
}

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────

export async function resetPasswordAction(newPassword: string): Promise<ActionResult> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─────────────────────────────────────────────
// GET SESSION
// ─────────────────────────────────────────────

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─────────────────────────────────────────────
// OAUTH
// ─────────────────────────────────────────────

export async function oauthAction(provider: Provider): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    return { success: false, error: error?.message ?? 'OAuth failed' }
  }

  redirect(data.url)
}