'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  Shield,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  PauseCircle,
  FileText,
  Wallet,
  FileSearch,
  ArrowUpRight,
} from 'lucide-react'
import { StatusChip } from '@/components/ui/status-chip'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatCard } from '@/components/admin/shared/stat-card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface SuperAdminStats {
  adminCount: number
  applicantCount: number
  applicationCount: number
  pendingCount: number
  processingCount: number
  approvedCount: number
  rejectedCount: number
  pausedCount: number
  monthlyApps: { month: string; count: number }[]
  appsByStatus: { label: string; count: number }[]
  recentApps: { name: string; code: string; status: string; updatedAt: string }[]
}

interface Props {
  stats: SuperAdminStats
}

const STATUS_PIE_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  paused: '#9ca3af',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  paused: 'Paused',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-brand-neutral-200 bg-white px-3 py-2 shadow-sm text-sm">
      <p className="text-xs text-brand-neutral-500">{label}</p>
      <p className="text-sm font-semibold text-brand-neutral-900">{payload[0].value} applications</p>
    </div>
  )
}

function StatusTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="rounded-lg border border-brand-neutral-200 bg-white px-3 py-2 shadow-sm text-sm">
      <p className="text-xs text-brand-neutral-500 capitalize">{name}</p>
      <p className="text-sm font-semibold text-brand-neutral-900">{value}</p>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-brand-neutral-100 p-3">
      <Icon className={`size-5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-xs text-brand-neutral-400 truncate">{label}</p>
        <p className="text-sm font-semibold text-brand-neutral-900">{value}</p>
      </div>
    </div>
  )
}

export function SuperAdminDashboardClient({ stats }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const pieData = stats.appsByStatus.map((d) => ({
    name: STATUS_LABEL[d.label] ?? d.label,
    value: d.count,
    color: STATUS_PIE_COLORS[d.label] ?? '#6b7280',
  }))

  const areaData = stats.monthlyApps.map((m) => ({
    ...m,
    label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Super Admin Dashboard" />

      {/* Primary KPI cards (clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Admin Accounts"
          value={stats.adminCount}
          iconBgClass="bg-brand-primary-600"
          iconColorClass="text-white"
          onClick={() => startTransition(() => router.push('/super-admin/manage-admins'))}
        />
        <StatCard
          icon={Users}
          label="Applicants"
          value={stats.applicantCount}
          iconBgClass="bg-brand-secondary-500"
          iconColorClass="text-white"
          onClick={() => startTransition(() => router.push('/super-admin/manage-clients'))}
        />
        <StatCard
          icon={Building2}
          label="Applications"
          value={stats.applicationCount}
          iconBgClass="bg-amber-600"
          iconColorClass="text-white"
          onClick={() => startTransition(() => router.push('/super-admin/manage-clients'))}
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pendingCount}
          iconBgClass="bg-rose-600"
          iconColorClass="text-white"
          onClick={() => startTransition(() => router.push('/super-admin/manage-clients'))}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart — monthly application trends */}
        <div className="lg:col-span-2 rounded-xl border border-brand-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-4">Applications (Last 90 Days)</h3>
          {areaData.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 py-8 text-center">No application data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#871426" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#871426" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#871426"
                  strokeWidth={2}
                  fill="url(#appGradient)"
                  dot={{ r: 3, fill: '#871426', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#871426', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — applications by status */}
        <div className="rounded-xl border border-brand-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-4">Applications by Status</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 py-8 text-center">No applications yet.</p>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-brand-neutral-600 capitalize">{d.name}</span>
                    <span className="text-[11px] font-medium text-brand-neutral-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="rounded-xl border border-brand-neutral-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-brand-neutral-900 mb-3">Quick Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard icon={CheckCircle2} label="Approved" value={stats.approvedCount} color="text-green-600" />
          <SummaryCard icon={Clock} label="Pending" value={stats.pendingCount} color="text-amber-600" />
          <SummaryCard icon={Loader2} label="Processing" value={stats.processingCount} color="text-blue-600" />
          <SummaryCard icon={XCircle} label="Rejected" value={stats.rejectedCount} color="text-red-600" />
          <SummaryCard icon={PauseCircle} label="Paused" value={stats.pausedCount} color="text-gray-600" />
          <SummaryCard icon={Shield} label="Admins" value={stats.adminCount} color="text-violet-600" />
          <SummaryCard icon={Users} label="Applicants" value={stats.applicantCount} color="text-brand-secondary-600" />
          <SummaryCard icon={Building2} label="Total Apps" value={stats.applicationCount} color="text-amber-600" />
        </div>
      </div>

      {/* Recent applications */}
      <div>
        <h2 className="text-xl font-semibold text-brand-neutral-900 mb-3">Recent Applications</h2>
        <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-neutral-50 border-b border-brand-neutral-200">
                <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Applicant</TableHead>
                <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Code</TableHead>
                <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-brand-neutral-400 py-12">
                    No applications yet.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentApps.map((app, i) => (
                  <TableRow key={`${app.code}-${i}`}>
                    <TableCell className="font-medium text-brand-neutral-900">{app.name}</TableCell>
                    <TableCell className="text-brand-neutral-500">{app.code}</TableCell>
                    <TableCell>
                      <StatusChip status={app.status} />
                    </TableCell>
                    <TableCell className="text-brand-neutral-400 text-xs">
                      {new Date(app.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
