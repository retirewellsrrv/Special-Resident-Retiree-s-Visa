export const dynamic = 'force-dynamic'

import { getPayments, getPaymentStats } from '@/actions/admin/payments'
import { PaymentsClient } from '@/components/admin/payments/payments-client'
import { AutoRefresh } from '@/components/shared/auto-refresh'

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; method?: string; type?: string; code?: string; name?: string; q?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const status = resolvedParams.status
  const method = resolvedParams.method
  const type = resolvedParams.type
  const code = resolvedParams.code
  const name = resolvedParams.name
  const q = resolvedParams.q

  const [stats, { rows, total }] = await Promise.all([
    getPaymentStats(),
    getPayments({ page, limit: 10, status, method, type, code, name, search: q }),
  ])

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <PaymentsClient
      rows={rows}
      total={total}
      stats={stats}
      page={page}
      statusFilter={status}
      methodFilter={method}
      typeFilter={type}
      codeFilter={code}
      nameFilter={name}
      q={q}
    />
    </>
  )
}
