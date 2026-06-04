'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

import {
  servicePlanSchema,
  updateServicePlanSchema,
} from '@/schemas/service'

export async function getServicePlans() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_plans')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createServicePlan(payload: unknown) {
  const supabase = await createClient()

  const validated = servicePlanSchema.safeParse(payload)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  const { error } = await supabase
    .from('service_plans')
    .insert(validated.data)

  if (error) return { error: error.message }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function updateServicePlan(
  id: number,
  payload: unknown
) {
  const supabase = await createClient()

  const validated = updateServicePlanSchema.safeParse(payload)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  const { error } = await supabase
    .from('service_plans')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function deleteServicePlan(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_plans')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function getPublicServicePlans() {
  const supabase = await createClient()

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
  const supabase = await createClient()

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

  return { success: true }
}
