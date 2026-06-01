'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

import {
  serviceSchema,
  updateServiceSchema,
} from '@/schemas/service'
import { Service } from '@/types/services'

const SERVICE_TYPES = ['basic', 'premium', 'vip'] as const

export async function getServices() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createService(payload: Omit<Service, 'id'>) {
  const supabase = await createClient()  // ← missing

  const { id: _, ...safePayload } = payload as any

  const { error } = await supabase
    .from('services')
    .insert(safePayload)

  if (error) return { error: error.message }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function updateService(
  id: number,
  payload: Partial<Omit<Service, 'id'>>
) {
  const supabase = await createClient()

  const validated = updateServiceSchema.safeParse(payload)
  if (!validated.success) {
    return { error: validated.error.message }
  }

  const { error } = await supabase
    .from('services')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function deleteService(
  id: number
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/services')

  return { success: true }
}

export async function toggleServiceAvailability(
  id: number,
  isAvailable: boolean
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
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