import { createClient } from '@/lib/supabase/server'
import { Shield, Users, Building2, Activity } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()

  const { count: adminCount } = await supabase
    .from('admin_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: applicantCount } = await supabase
    .from('client_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: appCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  return {
    adminCount: adminCount ?? 0,
    applicantCount: applicantCount ?? 0,
    applicationCount: appCount ?? 0,
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
          icon={Activity}
          label="System Status"
          value={1}
          bgClass="bg-white"
          iconBgClass="bg-emerald-600"
        />
      </div>
    </div>
  )
}
