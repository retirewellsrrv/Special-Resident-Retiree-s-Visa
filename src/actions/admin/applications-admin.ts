'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ApplicationStatusEnum } from '@/schemas/client-profiles'

export type AppRow = {
    id: number
    client_id: string
    name: string
    application_code: string
    service_type: string
    status: string
    created_at: string
    updated_at: string
}

export type AppStats = {
    total: number
    submitted: number
    under_review: number
    pending_docs: number
    approved: number
    rejected: number
}

export type ActionState = { error: string | null; success: boolean }

export async function getApplicationStats(): Promise<AppStats> {
    const supabase = await createClient()

    const [
        { count: total },
        { count: submitted },
        { count: under_review },
        { count: pending_docs },
        { count: approved },
        { count: rejected },
    ] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending_documents'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    ])

    return {
        total: total ?? 0,
        submitted: submitted ?? 0,
        under_review: under_review ?? 0,
        pending_docs: pending_docs ?? 0,
        approved: approved ?? 0,
        rejected: rejected ?? 0,
    }
}

export async function getApplications({
    page = 1,
    limit = 10,
    status,
}: {
    page?: number
    limit?: number
    status?: string
} = {}): Promise<{ rows: AppRow[]; total: number }> {
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
            created_at,
            updated_at,
            client_profiles!applications_user_id_fkey (
                name
            )
            `,
            { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)

    if (status) query = query.eq('status', status as any)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const rows: AppRow[] = (data ?? []).map((row: any) => ({
        id: row.id,
        client_id: row.user_id,
        name: row.client_profiles?.name ?? 'Unknown',
        application_code: row.application_code,
        service_type: row.service_type,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }))

    return { rows, total: count ?? 0 }
}

export async function updateAppStatus(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const supabase = await createClient()

    const appId = formData.get('app_id')
    const status = formData.get('status')

    if (!appId || typeof appId !== 'string')
        return { error: 'Missing application ID', success: false }

    const parsed = ApplicationStatusEnum.safeParse(status)
    if (!parsed.success)
        return { error: 'Invalid status value', success: false }

    const { error } = await supabase
        .from('applications')
        .update({ status: parsed.data })
        .eq('id', Number(appId))

    if (error) return { error: error.message, success: false }

    revalidatePath('/admin/applications')
    return { error: null, success: true }
}
