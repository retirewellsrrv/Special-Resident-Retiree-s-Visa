import { getApplicationStats, getApplications, getApplicationDetail } from '@/actions/admin/applications-admin'
import { ApplicationsIndex } from '@/components/admin/applications/applications-index'

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; userId?: string; q?: string; app?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const status = resolvedParams.status
  const userId = resolvedParams.userId
  const search = resolvedParams.q

  const parsedApp = resolvedParams.app ? Number(resolvedParams.app) : null
  const hasAppParam = parsedApp != null && !Number.isNaN(parsedApp)

  const [stats, { rows, total }, detail] = await Promise.all([
    getApplicationStats(),
    getApplications({ page, limit: 10, status, userId, search }),
    hasAppParam ? getApplicationDetail(parsedApp!) : Promise.resolve(null),
  ])

  return (
    <ApplicationsIndex
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      statusFilter={status}
      userId={userId}
      search={search}
      appId={resolvedParams.app}
      detail={detail}
    />
  )
}