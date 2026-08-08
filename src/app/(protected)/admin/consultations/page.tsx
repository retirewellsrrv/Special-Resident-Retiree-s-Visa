import { getConsultationStats, getConsultationsForReview } from '@/actions/admin/consultations'
import { ConsultationsClient } from '@/components/admin/consultations/consultations'

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const resolvedParams = await searchParams
  const rawPage = Number(resolvedParams.page ?? 1)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const status = resolvedParams.status
  const search = resolvedParams.q

  const [stats, { rows, total }] = await Promise.all([
    getConsultationStats(),
    getConsultationsForReview({ page, status, search }),
  ])

  return (
    <ConsultationsClient
      stats={stats}
      rows={rows}
      total={total}
      page={page}
      statusFilter={status}
      search={search}
    />
  )
}
