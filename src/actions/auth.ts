'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Provider } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/client'

import { headers } from 'next/headers'


import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/schemas/auth'
import { getUserRole } from '@/utils/auth/getUser'

// Register flow: registerAction() → signUp() → redirect /confirm-email
// Email flow: user clicks link → Supabase verifies → callback?code=xxx → exchangeCodeForSession() → dashboard

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

  let role = data.user.user_metadata?.role as string | undefined

  // Check super_admin_profiles first — overrides metadata role
  const { data: superAdminProfile } = await supabase
    .from('super_admin_profiles')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (superAdminProfile) {
    role = 'super_admin'
  }

  // revalidatePath must run before any redirect()
  revalidatePath('/', 'layout')

  if (role === 'admin') {
    const adminSupabase = createAdminClient()
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('is_active')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!adminProfile || !adminProfile.is_active) {
      await supabase.auth.signOut()
      return { success: false, error: 'ACCOUNT_DISABLED' }
    }
  }

  if (role === 'super_admin') redirect('/super-admin/dashboard')
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
  const fullName = `${firstName} ${surname}`; //? parse and capitize 

  console.log(fullName)
  console.log(parsed.data.email)
  console.log(parsed.data.birthday)

  // check user if existing first
  const adminSupabase = createAdminClient()
  const { data: userData, error: userDataError } = await adminSupabase.auth.admin.listUsers()

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
    // ! needs to resend an confirmation link once the email is taken but not yet verified, the message is useless btw.
    // return {
    //   success: false,
    //   error:
    //     'This email is already registered but has not been confirmed yet. Please check your inbox.',
    // }
    resendConfirmationAction(parsed.data.email)
    redirect(`/confirm-email?email=${encodeURIComponent(parsed.data.email)}`)
  }


  // birhtday //? parse it before using 
  const birthday = parsed.data.birthday.split("T")[0]; //? sample output "2026-05-30"

  // accurate age
  const dob = new Date(birthday);
  const today = new Date();
  let userAge = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) userAge--;

  parsed.data.age = userAge;

  // if no existing user, proceed to sign up
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    phone: parsed.data.phoneNumber,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?roleType=applicant`,
      data: {
        role: 'applicant',
        name: fullName,
        sex: parsed.data.sex,
        birthday: parsed.data.birthday,
        nationality: capitalize(parsed.data.nationality),
        age: userAge,
      },
    },
  })

  if (signUpError) {
    console.error('signup error:', signUpError)
    return { success: false, error: signUpError.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/confirm-email?email=${encodeURIComponent(parsed.data.email)}`)
  // return { success: true, message: 'Please check your email to confirm your account' }
}




export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─────────────────────────────────────────────
// RESEND CONFIRMATION
// ─────────────────────────────────────────────

export async function resendConfirmationAction(email: string): Promise<ActionResult> {
  if (!email) return { success: false, error: 'Email is required.' }

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) return { success: false, error: error.message }
  return { success: true, message: 'Confirmation email resent!' }
}

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────

export async function handleResetRequest(email: string): Promise<ActionResult> {
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL
  // check if email exists in the db
  const user = await supabaseAdmin().auth.admin.listUsers();

  //! only used for debugging, REMOVE WHEN FEATURE IS DONE
  console.log('email exists, proceeding with reset:', email)
  console.log('user: ', user.data.users.find((u) => u.email === email))
  console.log('user from if: ', user)

  if (!user.data.users.find((u) => u.email === email)) {
    return { success: false, error: 'No account found with this email.' }
  }

  //* request for the change password email
  const supabase = await createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/forgot-password/change-password`,
  })

  //! only used for debugging, REMOVE WHEN FEATURE IS DONE
  console.log('reset password result:', { data, error })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password reset link sent. Check your email.' }
}

export async function savePasswordChange(email: string): Promise<ActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/forgot-password/change-password`,
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

  console.log('Password: ', newPassword)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No active session. Please request a new password reset link.' }
  }

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
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    return { success: false, error: error?.message ?? 'OAuth failed' }
  }

  redirect(data.url)
}