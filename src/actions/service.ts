'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import {
  serviceSchema,
  updateServiceSchema,
} from '@/schemas/service'

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

export async function createService(
  input: unknown
) {
  console.log('INPUT:', input)
console.log(
  'IS ARRAY:',
  Array.isArray(input)
)
  const parsed =
    serviceSchema.safeParse(input)

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/services')

  return { data }
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