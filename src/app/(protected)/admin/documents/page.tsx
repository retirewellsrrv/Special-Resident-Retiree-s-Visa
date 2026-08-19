import { getDocumentsForReview } from '@/actions/admin/documents'
import { DocumentsReview } from '@/components/admin/documents/documents-review'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; q?: string; sort?: string; page?: string; status?: string; doc?: string }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page ?? 1)
  const sort = (resolvedParams.sort ?? 'latest') as 'latest' | 'oldest' | 'most-pending' | 'alphabetical'
  const status = resolvedParams.status || undefined
  const initialSelectedId = resolvedParams.doc ? Number(resolvedParams.doc) : undefined

  const { rows, total } = await getDocumentsForReview({
    userId: resolvedParams.userId,
    search: resolvedParams.q,
    status,
    page,
  })

  return (
    <DocumentsReview
      docs={rows}
      total={total}
      page={page}
      search={resolvedParams.q}
      statusFilter={status}
      sort={sort}
      initialSelectedId={initialSelectedId}
    />
  )
}
