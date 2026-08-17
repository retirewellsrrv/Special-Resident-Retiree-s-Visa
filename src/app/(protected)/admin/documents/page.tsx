import { getDocumentsForReview, getDocumentStats } from '@/actions/admin/documents'
import { DocumentsIndex } from '@/components/admin/documents/documents-index'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; q?: string; sort?: string; page?: string; doc?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const sort = (resolvedParams.sort ?? 'latest') as 'latest' | 'oldest' | 'most-pending' | 'alphabetical'

  const [{ rows, total }, existingStats] = await Promise.all([
    getDocumentsForReview({
      userId: resolvedParams.userId,
      search: resolvedParams.q,
      page,
    }),
    getDocumentStats(),
  ])

  // Use paginated page stats, but total from server-side count
  const stats = { ...existingStats, total }

  return (
    <DocumentsIndex
      docs={rows}
      stats={stats}
      total={total}
      page={page}
      search={resolvedParams.q}
      sort={sort}
      docId={resolvedParams.doc}
    />
  )
}
