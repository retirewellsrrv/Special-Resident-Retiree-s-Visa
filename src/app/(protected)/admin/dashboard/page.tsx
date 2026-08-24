export const dynamic = 'force-dynamic'

import { getDashboardStats } from '@/actions/admin/dashboard'
import { DashboardClient } from '@/components/admin/dashboard/dashboard-client'
import { AutoRefresh } from '@/components/shared/auto-refresh'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return (
    <>
      <AutoRefresh />
      <DashboardClient stats={stats} />
    </>
  )
}
