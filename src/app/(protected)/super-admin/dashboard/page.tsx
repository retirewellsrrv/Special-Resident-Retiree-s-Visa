import { createAdminClient } from '@/lib/supabase/server'
import { SuperAdminDashboardClient } from '@/components/super-admin/dashboard/dashboard-client'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createAdminClient()

  const [
    { count: adminCount },
    { count: applicantCount },
    { count: appCount },
    { count: pendingCount },
    { count: processingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: pausedCount },
  ] = await Promise.all([
    supabase.from('admin_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('client_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
  ])

  const { data: recentApps } = await supabase
    .from('applications')
    .select('application_code, status, updated_at, user_id, client_profiles!inner(name)')
    .order('updated_at', { ascending: false })
    .limit(5)

  const mapped = (recentApps ?? []).map((a: Record<string, unknown>) => ({
    name: (a.client_profiles as Record<string, string> | null)?.name ?? 'Unknown',
    code: a.application_code as string,
    status: a.status as string,
    updatedAt: a.updated_at as string,
  }))

  // Monthly application trend (last 90 days)
  const { data: monthlyData } = await supabase
    .from('applications')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())

  const monthlyMap = new Map<string, number>()
  for (const app of (monthlyData ?? []) as { created_at: string }[]) {
    const key = app.created_at.slice(0, 7)
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1)
  }
  const monthlyApps = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Apps by status (for pie chart)
  const appsByStatus = [
    { label: 'pending', count: pendingCount ?? 0 },
    { label: 'processing', count: processingCount ?? 0 },
    { label: 'approved', count: approvedCount ?? 0 },
    { label: 'rejected', count: rejectedCount ?? 0 },
    { label: 'paused', count: pausedCount ?? 0 },
  ].filter((s) => s.count > 0)

  return {
    adminCount: adminCount ?? 0,
    applicantCount: applicantCount ?? 0,
    applicationCount: appCount ?? 0,
    pendingCount: pendingCount ?? 0,
    processingCount: processingCount ?? 0,
    approvedCount: approvedCount ?? 0,
    rejectedCount: rejectedCount ?? 0,
    pausedCount: pausedCount ?? 0,
    monthlyApps,
    appsByStatus,
    recentApps: mapped,
  }
}

export default async function SuperAdminDashboardPage() {
  const stats = await getStats()

  return <SuperAdminDashboardClient stats={stats} />
}
