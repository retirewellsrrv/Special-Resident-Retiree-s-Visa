import { AdminNotificationsList } from '@/components/admin/notifications-list'
import { AutoRefresh } from '@/components/shared/auto-refresh'

export default function AdminNotificationsPage() {
  return (
    <>
      <AutoRefresh intervalMs={60_000} />
      <AdminNotificationsList />
    </>
  )
}