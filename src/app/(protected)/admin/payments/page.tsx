export const dynamic = 'force-dynamic'

import { getPayments, getPaymentStats } from '@/actions/admin/payments'
import { PaymentsClient } from '@/components/admin/payments/payments-client'

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; method?: string; code?: string; name?: string; q?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const status = resolvedParams.status
  const method = resolvedParams.method
  const code = resolvedParams.code
  const name = resolvedParams.name
  const q = resolvedParams.q

  const [stats, { rows, total }] = await Promise.all([
    getPaymentStats(),
    getPayments({ page, limit: 10, status, method, code, name, search: q }),
  ])

  return (
    <PaymentsClient
      rows={rows}
      total={total}
      stats={stats}
      page={page}
      statusFilter={status}
      methodFilter={method}
      codeFilter={code}
      nameFilter={name}
      q={q}
    />
  )
}
