export const dynamic = 'force-dynamic'

import { getUsers } from '@/actions/admin/users'
import { UsersTable } from '@/components/super-admin/users/users-table'

export default async function ManageClientsPage() {
  const users = await getUsers()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-neutral-900">Manage Clients</h1>
        <p className="text-sm text-brand-neutral-500">
          View all registered applicants and their application status on the SRRV platform.
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  )
}
