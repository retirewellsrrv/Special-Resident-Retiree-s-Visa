import { createAdminClient } from '@/lib/supabase/server'
import { Shield, Users, Building2, Clock } from 'lucide-react'
import { StatusChip } from '@/components/ui/status-chip'

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
    .select('application_code, service_type, status, updated_at, user_id, client_profiles!inner(name)')
    .order('updated_at', { ascending: false })
    .limit(5)

  const mapped = (recentApps ?? []).map((a: Record<string, unknown>) => ({
    name: (a.client_profiles as Record<string, string> | null)?.name ?? 'Unknown',
    code: a.application_code as string,
    type: a.service_type as string,
    status: a.status as string,
    updatedAt: a.updated_at as string,
  }))

  return {
    adminCount: adminCount ?? 0,
    applicantCount: applicantCount ?? 0,
    applicationCount: appCount ?? 0,
    pendingCount: pendingCount ?? 0,
    processingCount: processingCount ?? 0,
    approvedCount: approvedCount ?? 0,
    rejectedCount: rejectedCount ?? 0,
    pausedCount: pausedCount ?? 0,
    recentApps: mapped,
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconBgClass,
}: {
  icon: React.ElementType
  label: string
  value: number
  iconBgClass: string
}) {
  return (
    <div className="rounded-xl border border-brand-neutral-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBgClass}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div>
          <p className="text-ht-caption text-brand-neutral-500">{label}</p>
          <p className="text-ht-headline-md text-brand-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

const STATUS_CARDS = [
  { label: 'Pending', value: 'pendingCount', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', valueText: 'text-amber-900' },
  { label: 'Processing', value: 'processingCount', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', valueText: 'text-blue-900' },
  { label: 'Approved', value: 'approvedCount', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', valueText: 'text-green-900' },
  { label: 'Rejected', value: 'rejectedCount', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', valueText: 'text-red-900' },
] as const

export default async function SuperAdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-ht-headline-md text-brand-neutral-900">Super Admin Dashboard</h1>
        <p className="text-ht-body-md text-brand-neutral-500">
          Overview of the entire SRRV platform.
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Admin Accounts"
          value={stats.adminCount}
          iconBgClass="bg-brand-primary-600"
        />
        <StatCard
          icon={Users}
          label="Applicants"
          value={stats.applicantCount}
          iconBgClass="bg-brand-secondary-500"
        />
        <StatCard
          icon={Building2}
          label="Applications"
          value={stats.applicationCount}
          iconBgClass="bg-amber-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount}
          iconBgClass="bg-rose-600"
        />
      </div>

      {/* Application status breakdown */}
      <div>
        <h2 className="text-ht-headline-md text-brand-neutral-900 mb-3">Application Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_CARDS.map((card) => (
            <div key={card.label} className={`rounded-xl ${card.bg} ${card.border} p-4`}>
              <p className={`text-ht-caption font-medium ${card.text} uppercase tracking-wider`}>{card.label}</p>
              <p className={`text-ht-headline-md font-bold ${card.valueText} mt-1`}>
                {stats[card.value as keyof typeof stats] as number}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent applications */}
      <div>
        <h2 className="text-ht-headline-md text-brand-neutral-900 mb-3">Recent Applications</h2>
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-sm" aria-label="Recent applications">
            <thead>
              <tr className="bg-brand-neutral-50 border-b border-brand-neutral-200">
                <th className="px-4 py-3 text-left text-ht-caption font-medium text-brand-neutral-400 uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-3 text-left text-ht-caption font-medium text-brand-neutral-400 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-ht-caption font-medium text-brand-neutral-400 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-ht-caption font-medium text-brand-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-ht-caption font-medium text-brand-neutral-400 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-100">
              {stats.recentApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ht-body-md text-brand-neutral-400">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                stats.recentApps.map((app, i) => (
                  <tr key={`${app.code}-${i}`} className="hover:bg-brand-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-neutral-900">{app.name}</td>
                    <td className="px-4 py-3 text-brand-neutral-500">{app.code}</td>
                    <td className="px-4 py-3 text-brand-neutral-500 capitalize">{app.type}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-brand-neutral-400 text-ht-caption">
                      {new Date(app.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
