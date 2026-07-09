'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

import {
  servicePlanSchema,
  updateServicePlanSchema,
} from '@/schemas/service'

export const getServicePlans = unstable_cache(
  async () => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
  ["admin-services"],
  { revalidate: 300, tags: ["admin-services"] },
)

export async function createServicePlan(payload: unknown) {
  const supabase = createAdminClient()

  const validated = servicePlanSchema.safeParse(payload)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  let previouslyHighlightedIds: number[] = []
  if (validated.data.highlighted) {
    const { data: featured } = await supabase
      .from('service_plans')
      .select('id')
      .eq('highlighted', true)
    previouslyHighlightedIds = (featured ?? []).map(p => p.id)

    await supabase
      .from('service_plans')
      .update({ highlighted: false })
      .eq('highlighted', true)
  }

  const { error } = await supabase
    .from('service_plans')
    .insert(validated.data)

  if (error) {
    if (previouslyHighlightedIds.length > 0) {
      await supabase
        .from('service_plans')
        .update({ highlighted: true })
        .in('id', previouslyHighlightedIds)
    }
    return { error: error.message }
  }

  revalidatePath('/admin/services')
  revalidateTag('admin-services', 'seconds')

  return { success: true }
}

export async function updateServicePlan(
  id: number,
  payload: unknown
) {
  const supabase = createAdminClient()

  const validated = updateServicePlanSchema.safeParse(payload)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  if (validated.data.highlighted) {
    await supabase
      .from('service_plans')
      .update({ highlighted: false })
      .neq('id', id)
      .eq('highlighted', true)
  }

  const { error } = await supabase
    .from('service_plans')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/services')
  revalidateTag('admin-services', 'seconds')

  return { success: true }
}

export async function deleteServicePlan(id: number) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('service_plans')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/services')
  revalidateTag('admin-services', 'seconds')

  return { success: true }
}

export async function setFeaturedService(id: number) {
  const supabase = createAdminClient()

  const { data: previouslyFeatured } = await supabase
    .from('service_plans')
    .select('id')
    .eq('highlighted', true)
    .neq('id', id)

  const previouslyFeaturedIds = (previouslyFeatured ?? []).map(p => p.id)

  const { error: resetError } = await supabase
    .from('service_plans')
    .update({ highlighted: false })
    .neq('id', id)
    .eq('highlighted', true)

  if (resetError) return { error: resetError.message }

  const { error } = await supabase
    .from('service_plans')
    .update({ highlighted: true })
    .eq('id', id)

  if (error) {
    if (previouslyFeaturedIds.length > 0) {
      await supabase
        .from('service_plans')
        .update({ highlighted: true })
        .in('id', previouslyFeaturedIds)
    }
    return { error: error.message }
  }

  revalidatePath('/admin/services')
  revalidateTag('admin-services', 'seconds')

  return { success: true }
}

export async function getPublicServicePlans() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('service_plans')
    .select('*')
    .eq('is_available', true)
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function toggleServicePlanAvailability(
  id: number,
  isAvailable: boolean
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('service_plans')
    .update({
      is_available: isAvailable,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/services')
  revalidateTag('admin-services', 'seconds')

  return { success: true }
}
