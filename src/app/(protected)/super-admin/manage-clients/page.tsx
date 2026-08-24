export const dynamic = 'force-dynamic'

import { getUsers } from '@/actions/admin/users'
import { UsersTable } from '@/components/super-admin/users/users-table'
import { PageHeader } from '@/components/admin/shared/page-header'

export default async function ManageClientsPage() {
  const users = await getUsers()

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Clients" />
      <UsersTable users={users} />
    </div>
  )
}
