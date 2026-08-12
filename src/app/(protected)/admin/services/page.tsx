export const dynamic = 'force-dynamic'

import { getServicePlans } from '@/actions/admin/service'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ServiceForm } from '@/components/admin/services/service-form'
import { ServiceTable } from '@/components/admin/services/service-table'

export default async function ServicesPage() {
  const services = await getServicePlans()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Plans"
        actions={<ServiceForm />}
      />

      <ServiceTable services={services} />
    </div>
  )
}