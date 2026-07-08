export const dynamic = 'force-dynamic'

import { getClientStats, getClientDirectory } from '@/actions/admin/client-profiles'
import { ClientProfilesClient } from '@/components/admin/client-profiles/client-profiles-client';

export default async function ClientProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; service_type?: string; status?: string; q?: string; application_code?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const filter = (resolvedParams.filter ?? 'all') as 'all' | 'new'
  const service_type = resolvedParams.service_type as 'basic' | 'premium' | 'vip' | undefined
  const status = resolvedParams.status as string | undefined
  const q = resolvedParams.q as string | undefined
  const application_code = resolvedParams.application_code as string | undefined

  const [stats, { rows, total }] = await Promise.all([
    getClientStats(),
    getClientDirectory({ page, filter, service_type: service_type || undefined, status, q, application_code }),
  ])

  return (
    <ClientProfilesClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      filter={filter}
      serviceType={service_type}
      statusFilter={status}
      q={q}
      applicationCode={application_code}
    />
  )
}