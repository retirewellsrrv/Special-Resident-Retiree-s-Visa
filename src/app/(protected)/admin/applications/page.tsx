import { getApplicationStats, getApplications } from '@/actions/admin/applications-admin'
import { ApplicationsClient } from '@/components/admin/applications/applications'
import { AutoRefresh } from '@/components/shared/auto-refresh'

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
  // Deep link from the Documents page (?app=<id>) — pre-selects the application.
  const appParam = Number(resolvedParams.app)
  const initialAppId = Number.isFinite(appParam) ? appParam : undefined

  const [stats, { rows, total }] = await Promise.all([
    getApplicationStats(),
    getApplications({ page, limit: 10, status, userId, search }),
  ])

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <ApplicationsClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      statusFilter={status}
      userId={userId}
      search={search}
      initialAppId={initialAppId}
    />
    </>
  )
}
