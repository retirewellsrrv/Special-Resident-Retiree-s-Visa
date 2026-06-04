'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { personalInfoSchema, contactInfoSchema } from '@/schemas/application'

export type SubmitState = { error: string | null; success: boolean }

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized', success: false }

  const serviceType = formData.get('serviceType') as string
  if (!serviceType || !['basic', 'premium', 'vip'].includes(serviceType)) {
    return { error: 'Please select a service plan', success: false }
  }

  const personalRaw = {
    fullName: formData.get('fullName'),
    dateOfBirth: formData.get('dateOfBirth'),
    gender: formData.get('gender'),
    nationality: formData.get('nationality'),
    maritalStatus: formData.get('maritalStatus'),
  }
  const personalParsed = personalInfoSchema.safeParse(personalRaw)
  if (!personalParsed.success) {
    return { error: personalParsed.error.issues[0]?.message ?? 'Invalid personal details', success: false }
  }

  const contactRaw = {
    email: formData.get('email'),
    phoneCode: formData.get('phoneCode'),
    phone: formData.get('phone'),
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    country: formData.get('country'),
    phAddress: formData.get('phAddress'),
    ecName: formData.get('ecName'),
    ecRelationship: formData.get('ecRelationship'),
    ecPhone: formData.get('ecPhone'),
  }
  const contactParsed = contactInfoSchema.safeParse(contactRaw)
  if (!contactParsed.success) {
    return { error: contactParsed.error.issues[0]?.message ?? 'Invalid contact details', success: false }
  }

  // Generate application code
  const code = `SRRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const { error: profileError } = await supabase.from('client_profiles').upsert({
    user_id: user.id,
    name: personalParsed.data.fullName,
    sex: personalParsed.data.gender as any,
    birthday: personalParsed.data.dateOfBirth,
    nationality: personalParsed.data.nationality,
    age: personalParsed.data.dateOfBirth
      ? Math.floor((Date.now() - new Date(personalParsed.data.dateOfBirth).getTime()) / (365.25 * 86400000))
      : 0,
    address: `${contactParsed.data.street}, ${contactParsed.data.city}, ${contactParsed.data.state} ${contactParsed.data.zip}, ${contactParsed.data.country}`,
  } as any, { onConflict: 'user_id' })

  if (profileError) return { error: profileError.message, success: false }

  const { error: appError } = await supabase.from('applications').insert({
    user_id: user.id,
    service_type: serviceType as any,
    application_code: code,
    status: 'submitted',
  } as any)

  if (appError) return { error: appError.message, success: false }

  revalidatePath('/applicant/application')
  return { error: null, success: true }
}
