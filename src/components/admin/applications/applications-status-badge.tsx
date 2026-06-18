import { StatusChip } from '@/components/ui/status-chip'

export function ApplicationStatusBadge({ status }: { status: string }) {
  return <StatusChip status={status} />
}
