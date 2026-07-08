export const dynamic = 'force-dynamic'

import { getDashboardStats } from '@/actions/admin/dashboard'
import { DashboardClient } from '@/components/admin/dashboard/dashboard-client'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <DashboardClient stats={stats} />
}
