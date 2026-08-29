export const dynamic = 'force-dynamic'

import { getServicePlans } from '@/actions/admin/service'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ServiceForm } from '@/components/admin/services/service-form'
import { ServiceTable } from '@/components/admin/services/service-table'
import { AutoRefresh } from '@/components/shared/auto-refresh'

export default async function ServicesPage() {
  const services = await getServicePlans()

  return (
    <>
      <AutoRefresh intervalMs={60_000} />
      <div className="space-y-4">
      <PageHeader
        title="Service Plans"
        actions={<ServiceForm />}
      />

      <ServiceTable services={services} />
    </div>
    </>
  )
}