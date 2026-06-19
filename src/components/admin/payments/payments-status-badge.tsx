import { StatusChip } from '@/components/ui/status-chip'

export default function StatusBadge({ status }: { status: string }) {
  return <StatusChip status={status} />
}
