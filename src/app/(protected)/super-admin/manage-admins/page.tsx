export const dynamic = 'force-dynamic'

import { getAdmins } from '@/actions/admin/admins'
import { AdminTable } from '@/components/super-admin/admins/admin-table'

export default async function ManageAdminsPage() {
  const admins = await getAdmins()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-neutral-900">Manage Admins</h1>
        <p className="text-sm text-brand-neutral-500">
          Create and manage admin accounts for the SRRV platform.
        </p>
      </div>
      <AdminTable admins={admins} />
    </div>
  )
}
