export const dynamic = 'force-dynamic'

import { getAdmins } from '@/actions/admin/admins'
import { AdminTable } from '@/components/super-admin/admins/admin-table'
import { PageHeader } from '@/components/admin/shared/page-header'

export default async function ManageAdminsPage() {
  const admins = await getAdmins()

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Admins" />
      <AdminTable admins={admins} />
    </div>
  )
}
