import { getApplicationStats, getApplications } from '@/actions/admin/applications-admin'
import { ApplicationsClient } from '@/components/admin/applications'

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const status = searchParams.status

  const [stats, { rows, total }] = await Promise.all([
    getApplicationStats(),
    getApplications({ page, limit: 10, status }),
  ])

  return (
    <ApplicationsClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      statusFilter={status}
    />
  )
}
