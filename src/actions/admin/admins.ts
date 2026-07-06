'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

export type AdminWithUser = {
  user_id: string
  name: string
  email: string
  is_active: boolean | null
  created_at: string
  email_confirmed: boolean
}

export async function getAdmins(): Promise<AdminWithUser[]> {
  const supabase = createAdminClient()

  const { data: profiles } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('name')

  const { data: { users } } = await supabase.auth.admin.listUsers()

  if (!profiles) return []

  const userMap = new Map(users?.map(u => [u.id, u]) ?? [])

  return profiles.map(p => {
    const authUser = userMap.get(p.user_id)
    return {
      user_id: p.user_id,
      name: p.name,
      email: authUser?.email ?? '',
      is_active: p.is_active,
      created_at: authUser?.created_at ?? '',
      email_confirmed: !!authUser?.email_confirmed_at,
    }
  })
}

export async function createAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = createAdminClient()

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?roleType=admin`,
      data: {
        role: 'admin',
        name,
      },
    },
  })

  if (signUpError || !data.user) {
    return { error: signUpError?.message ?? 'Failed to create user.' }
  }

  const { error: profileError } = await supabase
    .from('admin_profiles')
    .insert({
      user_id: data.user.id,
      name,
      is_active: true,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/super-admin/manage-admins')
  return { success: true, message: 'Admin created. They need to check their email to confirm their account.' }
}

export async function toggleAdminActive(userId: string, isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('admin_profiles')
    .update({ is_active: isActive })
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/super-admin/manage-admins')
  return { success: true }
}

export async function deleteAdmin(userId: string) {
  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('admin_profiles')
    .delete()
    .eq('user_id', userId)

  if (profileError) return { error: profileError.message }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  revalidatePath('/super-admin/manage-admins')
  return { success: true }
}
