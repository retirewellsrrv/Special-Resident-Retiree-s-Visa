import { getClientStats, getClientDirectory } from '@/actions/admin/client-profiles'
import { ClientProfilesClient } from '@/components/admin/client-profiles/client-profiles-client';

export default async function ClientProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const status = resolvedParams.status as string | undefined
  const q = resolvedParams.q as string | undefined

  const [stats, { rows, total }] = await Promise.all([
    getClientStats(),
    getClientDirectory({ page, status, q }),
  ])

  return (
    <ClientProfilesClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      statusFilter={status}
      q={q}
    />
  )
}