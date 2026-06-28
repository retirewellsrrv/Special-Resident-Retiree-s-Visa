export const dynamic = 'force-dynamic'

import { getDocumentsForReview } from '@/actions/admin/documents'
import { DocumentsReview } from '@/components/admin/documents/documents-review'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; q?: string }>
}) {
  const resolvedParams = await searchParams
  const { rows, stats } = await getDocumentsForReview({
    userId: resolvedParams.userId,
    search: resolvedParams.q,
  })

  return <DocumentsReview docs={rows} stats={stats} search={resolvedParams.q} />
}
