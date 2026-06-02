import { getServices } from '@/actions/admin/service'
import { ServiceForm } from '@/components/admin/service-form'
import { ServiceTable } from '@/components/admin/service-table'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Create, manage, and monitor service packages offered to applicants.
          </p>
        </div>
        <ServiceForm />
      </div>

      <ServiceTable services={services} />
    </div>
  )
}
