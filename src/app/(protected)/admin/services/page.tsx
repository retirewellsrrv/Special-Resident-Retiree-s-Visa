export const dynamic = 'force-dynamic'

import { getServicePlans } from '@/actions/admin/service'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ServiceForm } from '@/components/admin/services/service-form'
import { ServiceCards } from '@/components/admin/services/service-cards'
import { ServiceTable } from '@/components/admin/services/service-table'

export default async function ServicesPage() {
  const services = await getServicePlans()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Service plans"
        description="Create, manage, and monitor service packages offered to applicants."
        actions={<ServiceForm />}
      />

      <ServiceCards services={services} />

      <div className="space-y-2.5">
        <h2 className="text-sm font-medium text-brand-neutral-900">All plans</h2>
        <ServiceTable services={services} />
      </div>
    </div>
  )
}