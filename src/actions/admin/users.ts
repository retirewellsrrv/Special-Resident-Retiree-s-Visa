'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/utils/auth/getUser'

export type UserWithProfile = {
  user_id: string
  name: string
  email: string
  nationality: string | null
  sex: string | null
  age: number | null
  marital_status: string | null
  application_status: string | null
  service_type: string | null
  application_code: string | null
  created_at: string
}

export async function getUsers(): Promise<UserWithProfile[]> {
  const auth = await requireSuperAdmin()
  if (!auth.authorized) throw new Error(auth.error)

  const supabase = createAdminClient()

  const { data: profiles } = await supabase
    .from('client_profiles')
    .select('*')
    .order('name')

  const { data: { users } } = await supabase.auth.admin.listUsers()

  if (!profiles) return []

  const userMap = new Map(users?.map(u => [u.id, u]) ?? [])

  const userIds = profiles.map(p => p.user_id)

  const { data: applications } = await supabase
    .from('applications')
    .select('user_id, status, service_type, application_code')
    .in('user_id', userIds)

  const appMap = new Map(applications?.map(a => [a.user_id, a]) ?? [])

  return profiles.map(p => {
    const authUser = userMap.get(p.user_id)
    const app = appMap.get(p.user_id)

    return {
      user_id: p.user_id,
      name: p.name,
      email: authUser?.email ?? '',
      nationality: p.nationality ?? null,
      sex: p.sex ?? null,
      age: p.age ?? null,
      marital_status: p.marital_status ?? null,
      application_status: app?.status ?? null,
      service_type: app?.service_type ?? null,
      application_code: app?.application_code ?? null,
      created_at: authUser?.created_at ?? '',
    }
  })
}
