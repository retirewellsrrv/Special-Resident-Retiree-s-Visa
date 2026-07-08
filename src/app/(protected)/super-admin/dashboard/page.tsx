import { createAdminClient } from '@/lib/supabase/server'
import { Shield, Users, Building2, Clock, CheckCircle, XCircle, Pause, Loader } from 'lucide-react'

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

  return {
    adminCount: adminCount ?? 0,
    applicantCount: applicantCount ?? 0,
    applicationCount: appCount ?? 0,
    pendingCount: pendingCount ?? 0,
    processingCount: processingCount ?? 0,
    approvedCount: approvedCount ?? 0,
    rejectedCount: rejectedCount ?? 0,
    pausedCount: pausedCount ?? 0,
    recentApps: (recentApps ?? []).map((a: any) => ({
      name: a.client_profiles?.name ?? 'Unknown',
      code: a.application_code,
      type: a.service_type,
      status: a.status,
      updatedAt: a.updated_at,
    })),
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  bgClass,
  iconBgClass,
}: {
  icon: React.ElementType
  label: string
  value: number
  bgClass: string
  iconBgClass: string
}) {
  return (
    <div className={`rounded-xl p-5 ${bgClass} border border-brand-neutral-200`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBgClass}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-brand-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-brand-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  paused: 'bg-gray-50 text-gray-700 border border-gray-200',
}

export default async function SuperAdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-neutral-900">Super Admin Dashboard</h1>
        <p className="text-sm text-brand-neutral-500">
          Overview of the entire SRRV platform.
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Admin Accounts"
          value={stats.adminCount}
          bgClass="bg-white"
          iconBgClass="bg-brand-primary-600"
        />
        <StatCard
          icon={Users}
          label="Applicants"
          value={stats.applicantCount}
          bgClass="bg-white"
          iconBgClass="bg-brand-secondary-500"
        />
        <StatCard
          icon={Building2}
          label="Applications"
          value={stats.applicationCount}
          bgClass="bg-white"
          iconBgClass="bg-amber-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount}
          bgClass="bg-white"
          iconBgClass="bg-rose-600"
        />
      </div>

      {/* Application status breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-brand-neutral-900 mb-3">Application Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Processing</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.processingCount}</p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.approvedCount}</p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div>
        <h2 className="text-lg font-semibold text-brand-neutral-900 mb-3">Recent Applications</h2>
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-neutral-50 border-b border-brand-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-100">
              {stats.recentApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-brand-neutral-400">
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
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_STYLES[app.status] ?? 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-neutral-400 text-xs">
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
