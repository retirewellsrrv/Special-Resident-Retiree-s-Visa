import { getClientStats, getClientDirectory } from '@/actions/admin/client-profiles'
import { ClientProfilesClient } from '@/components/admin/client-profiles-form';

export default async function ClientProfilesPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string; service_type?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const filter = (searchParams.filter ?? 'all') as 'all' | 'new'
  const service_type = searchParams.service_type as 'basic' | 'premium' | 'vip' | undefined

  const [stats, { rows, total }] = await Promise.all([
    getClientStats(),
    getClientDirectory({ page, filter, service_type: service_type || undefined }),
  ])

  return (
    <ClientProfilesClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      filter={filter}
      serviceType={service_type}
    />
  )
}