// app/admin/services/page.tsx

import { getServices } from '@/actions/service'
import { ServiceTable } from '@/components/admin/service-table'
import { ServiceForm } from '@/components/admin/service-form'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Manage service packages
        </p>
      </div>

      <ServiceForm />

      <ServiceTable services={services} />
    </div>
  )
}