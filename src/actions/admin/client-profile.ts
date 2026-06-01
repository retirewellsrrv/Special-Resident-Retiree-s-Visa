'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
    clientProfileSchema,
    ClientStatusEnum,
} from '@/schemas/client-profile'

export type ActionState = { error: string | null; success: boolean }

export type ClientRow = {
    user_id: string
    name: string
    application_code: string
    service_type: string
    status: string
    updated_at: string
}

export type ClientStats = {
    total: number
    processing: number
    approved: number
    rejected: number
    paused: number
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getClientStats(): Promise<ClientStats> {
    const supabase = await createClient()

    const [
        { count: total },
        { count: processing },
        { count: approved },
        { count: rejected },
        { count: paused },
    ] = await Promise.all([
        supabase.from('client_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
    ])

    return {
        total: total ?? 0,
        processing: processing ?? 0,
        approved: approved ?? 0,
        rejected: rejected ?? 0,
        paused: paused ?? 0,
    }
}

export async function getClientDirectory({
    page = 1,
    limit = 10,
    filter = 'all',
    service_type,
}: {
    page?: number
    limit?: number
    filter?: 'all' | 'new'
    service_type?: string
} = {}): Promise<{ rows: ClientRow[]; total: number }> {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('applications')
        .select(
            `
            id,
            user_id,
            service_type,
            application_code,
            status,
            updated_at,
            created_at,
            client_profiles!inner (
                name
            )
            `,
            { count: 'exact' },
        )
        .order('updated_at', { ascending: false })
        .range(from, to)

    if (service_type) query = query.eq('service_type', service_type as 'basic' | 'premium' | 'vip')
    if (filter === 'new') {
        const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString()
        query = query.gte('created_at', cutoff)
    }

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const rows: ClientRow[] = (data ?? []).map((row: any) => ({
        user_id: row.user_id,
        name: row.client_profiles.name,
        application_code: row.application_code,
        service_type: row.service_type,
        status: row.status,
        updated_at: row.updated_at,
    }))

    return { rows, total: count ?? 0 }
}

export async function getClientProfiles() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('client_profiles')
        .select('user_id, name, sex, birthday, nationality, age, address')
        .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function updateClientProfile(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const supabase = await createClient()

    const userId = formData.get('user_id')
    if (!userId || typeof userId !== 'string')
        return { error: 'Missing user ID', success: false }

    const raw = {
        name: formData.get('name'),
        sex: formData.get('sex'),
        birthday: formData.get('birthday'),
        nationality: formData.get('nationality'),
        age: Number(formData.get('age')),
        address: formData.get('address') || undefined,
    }

    const parsed = clientProfileSchema.safeParse(raw)
    if (!parsed.success) {
        return {
            error: parsed.error.message,
            success: false,
        }
    }

    const { error } = await supabase
        .from('client_profiles')
        .update(parsed.data)
        .eq('user_id', userId)

    if (error) return { error: error.message, success: false }

    revalidatePath('/admin/applicants')
    return { error: null, success: true }
}

export async function resolveReview(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const supabase = await createClient()

    const user_id = formData.get('user_id')
    if (!user_id || typeof user_id !== 'string')
        return { error: 'Missing user ID', success: false }

    const { error } = await supabase
        .from('applications')
        .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id)
        .eq('status', 'paused')

    if (error) return { error: error.message, success: false }

    revalidatePath('/admin/applicants')
    return { error: null, success: true }
}

export async function createClientProfile(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const raw = {
        name: formData.get('name'),
        sex: formData.get('sex'),
        birthday: formData.get('birthday'),
        nationality: formData.get('nationality'),
        age: Number(formData.get('age')),
        address: (formData.get('address') as string) ?? '',  // always a string
    }

    const parsed = clientProfileSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.message, success: false }
    }

    const { error } = await supabase
        .from('client_profiles')
        .insert({
            ...parsed.data,
            user_id: user.id,
            address: (formData.get('address') as string | null) ?? '',
        })

    if (error) return { error: error.message, success: false }

    revalidatePath('/admin/applicants')
    return { error: null, success: true }
}

export async function updateApplicationStatus(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const supabase = await createClient()

    const user_id = formData.get('user_id')
    const status = formData.get('status')

    if (!user_id || typeof user_id !== 'string')
        return { error: 'Missing user ID', success: false }

    const parsed = ClientStatusEnum.safeParse(status)
    if (!parsed.success)
        return { error: 'Invalid status value', success: false }

    const { error } = await supabase
        .from('applications')
        .update({
            status: parsed.data,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id)

    if (error) return { error: error.message, success: false }

    revalidatePath('/admin/applicants')
    return { error: null, success: true }
}