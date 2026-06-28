'use client'

import { useRouter } from 'next/navigation'
import {
  Users,
  FileText,
  Wallet,
  FileSearch,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { StatusChip } from '@/components/ui/status-chip'
import { PageHeader } from '@/components/admin/shared/page-header'
import type { DashboardStats } from '@/actions/admin/dashboard'

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  paused: 'Paused',
}

const MAX_BAR_HEIGHT = 160

interface Props {
  stats: DashboardStats
}

export function DashboardClient({ stats }: Props) {
  const router = useRouter()

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1)
  const maxApps = Math.max(...stats.appsByService.map((a) => a.count), 1)
  const maxStatus = Math.max(...stats.appsByStatus.map((a) => a.count), 1)

  const totalPendingReview = stats.applications.pending + stats.applications.processing

  const kpis = [
    {
      label: 'Total Applications',
      value: stats.applications.total,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      href: '/admin/applications',
      sub: `${totalPendingReview} pending review`,
    },
    {
      label: 'Total Revenue',
      value: fmtMoney(stats.payments.revenue),
      icon: Wallet,
      color: 'text-green-600 bg-green-50',
      href: '/admin/payments',
      sub: `${stats.payments.success} successful payments`,
    },
    {
      label: 'Registered Users',
      value: stats.users.total,
      icon: Users,
      color: 'text-violet-600 bg-violet-50',
      href: '/admin/profiles',
      sub: `${stats.applications.approved} approved applications`,
    },
    {
      label: 'Documents Pending',
      value: stats.documents.pendingReview,
      icon: FileSearch,
      color: 'text-amber-600 bg-amber-50',
      href: '/admin/documents',
      sub: `${stats.documents.total} total documents`,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of SRRV application activity, revenue, and pending tasks."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <button
              key={kpi.label}
              onClick={() => router.push(kpi.href)}
              className="flex items-start gap-4 rounded-xl border border-brand-neutral-200 bg-white p-5 text-left transition-all duration-200 hover:border-brand-neutral-300 hover:shadow-sm"
            >
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${kpi.color}`}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="mt-1 text-2xl font-semibold text-brand-neutral-900">{kpi.value}</p>
                <p className="mt-0.5 text-xs text-brand-neutral-400 truncate">{kpi.sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-brand-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-4">Revenue (Last 90 Days)</h3>
          {stats.monthlyRevenue.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 py-8 text-center">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {stats.monthlyRevenue.map((m) => {
                const height = Math.max((m.revenue / maxRevenue) * MAX_BAR_HEIGHT, 8)
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-medium text-brand-neutral-500">
                      {fmtMoney(m.revenue)}
                    </span>
                    <div
                      className="w-full rounded-md bg-brand-primary-600/80 transition-all hover:bg-brand-primary-600"
                      style={{ height: `${height}px` }}
                      title={`${m.month}: ${fmtMoney(m.revenue)}`}
                    />
                    <span className="text-[10px] text-brand-neutral-400">
                      {new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Applications by Status */}
        <div className="rounded-xl border border-brand-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {stats.appsByStatus.map((item) => {
              const pct = stats.applications.total ? (item.count / stats.applications.total) * 100 : 0
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-brand-neutral-700 capitalize">{STATUS_LABEL[item.label] ?? item.label}</span>
                    <span className="text-sm font-medium text-brand-neutral-900">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.label === 'approved' ? 'bg-green-500' :
                        item.label === 'rejected' ? 'bg-red-400' :
                        item.label === 'pending' ? 'bg-amber-400' :
                        item.label === 'processing' ? 'bg-blue-400' :
                        item.label === 'paused' ? 'bg-gray-400' :
                        'bg-brand-primary-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Applications */}
        <div className="rounded-xl border border-brand-neutral-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-neutral-100">
            <h3 className="text-sm font-semibold text-brand-neutral-900">Recent Applications</h3>
            <button
              onClick={() => router.push('/admin/applications')}
              className="text-xs font-medium text-brand-primary-600 hover:text-brand-primary-800"
            >
              View all
            </button>
          </div>
          {stats.recentApplications.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 px-5 py-8 text-center">No applications yet.</p>
          ) : (
            <div className="divide-y divide-brand-neutral-50">
              {stats.recentApplications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => router.push(`/admin/applications?userId=${app.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-brand-neutral-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900 truncate">{app.applicant_name}</p>
                    <p className="text-xs text-brand-neutral-400 truncate mt-0.5">{app.application_code}</p>
                  </div>
                  <span className="text-xs text-brand-neutral-400 capitalize">{app.service_type}</span>
                  <StatusChip status={app.status} />
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pending Documents */}
        <div className="rounded-xl border border-brand-neutral-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-neutral-100">
            <h3 className="text-sm font-semibold text-brand-neutral-900">Documents Pending Review</h3>
            <button
              onClick={() => router.push('/admin/documents')}
              className="text-xs font-medium text-brand-primary-600 hover:text-brand-primary-800"
            >
              View all
            </button>
          </div>
          {stats.pendingDocuments.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 px-5 py-8 text-center">All documents reviewed.</p>
          ) : (
            <div className="divide-y divide-brand-neutral-50">
              {stats.pendingDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push('/admin/documents')}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-brand-neutral-50"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Clock className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900 truncate">{doc.applicant_name}</p>
                    <p className="text-xs text-brand-neutral-400 truncate mt-0.5 capitalize">{doc.doc_type}</p>
                  </div>
                  <span className="text-xs text-brand-neutral-400">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Plan Distribution + Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-brand-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-4">Service Plans</h3>
          {stats.appsByService.length === 0 ? (
            <p className="text-sm text-brand-neutral-400 py-4 text-center">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.appsByService.map((item) => {
                const pct = stats.applications.total ? (item.count / stats.applications.total) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-brand-neutral-700 capitalize">{item.label}</span>
                      <span className="text-sm font-medium text-brand-neutral-900">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-secondary-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-brand-neutral-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-brand-neutral-900 mb-3">Quick Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard
              icon={CheckCircle2}
              label="Approved"
              value={stats.applications.approved}
              color="text-green-600"
            />
            <SummaryCard
              icon={Clock}
              label="Pending"
              value={stats.applications.pending}
              color="text-amber-600"
            />
            <SummaryCard
              icon={Loader2}
              label="Processing"
              value={stats.applications.processing}
              color="text-blue-600"
            />
            <SummaryCard
              icon={XCircle}
              label="Rejected"
              value={stats.applications.rejected}
              color="text-red-600"
            />
            <SummaryCard
              icon={PauseCircle}
              label="Paused"
              value={stats.applications.paused}
              color="text-gray-600"
            />
            <SummaryCard
              icon={Wallet}
              label="Revenue"
              value={fmtMoney(stats.payments.revenue)}
              color="text-green-600"
            />
            <SummaryCard
              icon={FileSearch}
              label="Docs Pending"
              value={stats.documents.pendingReview}
              color="text-amber-600"
            />
            <SummaryCard
              icon={Users}
              label="Users"
              value={stats.users.total}
              color="text-violet-600"
            />
          </div>
        </div>
      </div>
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
