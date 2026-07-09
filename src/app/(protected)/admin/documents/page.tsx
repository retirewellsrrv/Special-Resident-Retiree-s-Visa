import { getDocumentsForReview } from '@/actions/admin/documents'
import { DocumentsReview } from '@/components/admin/documents/documents-review'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; q?: string; sort?: string }>
}) {
  const resolvedParams = await searchParams
  const sort = (resolvedParams.sort ?? 'latest') as 'latest' | 'oldest' | 'most-pending' | 'alphabetical'
  const { rows, stats } = await getDocumentsForReview({
    userId: resolvedParams.userId,
    search: resolvedParams.q,
  })

  return <DocumentsReview docs={rows} stats={stats} search={resolvedParams.q} sort={sort} />
}
