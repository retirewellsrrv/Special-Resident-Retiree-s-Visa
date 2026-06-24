'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export type AdminWithUser = {
  user_id: string
  name: string
  email: string
  is_active: boolean | null
  created_at: string
}

export async function getAdmins(): Promise<AdminWithUser[]> {
  const supabase = createAdminClient()

  const { data: profiles } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('name')

  const { data: { users } } = await supabaseAdmin().auth.admin.listUsers()

  if (!profiles) return []

  const userMap = new Map(users?.map(u => [u.id, u]) ?? [])

  return profiles.map(p => ({
    user_id: p.user_id,
    name: p.name,
    email: userMap.get(p.user_id)?.email ?? '',
    is_active: p.is_active,
    created_at: userMap.get(p.user_id)?.created_at ?? '',
  }))
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

  const { data: authData, error: authError } = await supabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin', name },
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Failed to create user.' }
  }

  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('admin_profiles')
    .insert({
      user_id: authData.user.id,
      name,
      is_active: true,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/super-admin/admins')
  return { success: true }
}

export async function toggleAdminActive(userId: string, isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('admin_profiles')
    .update({ is_active: isActive })
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/super-admin/admins')
  return { success: true }
}

export async function deleteAdmin(userId: string) {
  const supabase = createAdminClient()

  const { error: profileError } = await supabase
    .from('admin_profiles')
    .delete()
    .eq('user_id', userId)

  if (profileError) return { error: profileError.message }

  revalidatePath('/super-admin/admins')
  return { success: true }
}
