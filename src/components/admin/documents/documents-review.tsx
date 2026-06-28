'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ReviewQueue } from './review-queue'
import { DocumentViewer } from './document-viewer'
import { ReviewActions } from './review-actions'
import type { DocumentForReview, ReviewStats } from '@/actions/admin/documents'

interface Props {
  docs: DocumentForReview[]
  stats: ReviewStats
  search?: string
}

export function DocumentsReview({ docs, stats, search }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search ?? '')
  const [selectedDoc, setSelectedDoc] = useState<DocumentForReview | null>(docs[0] ?? null)

  const handleSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      router.push(`/admin/documents?${params.toString()}`)
    },
    [router],
  )

  const handleClear = useCallback(() => {
    setSearchValue('')
    handleSearch('')
  }, [handleSearch])

  const handleSelect = useCallback((doc: DocumentForReview) => {
    setSelectedDoc(doc)
  }, [])

  const handleStatusChange = useCallback((docId: number) => {
    setSelectedDoc((prev) => {
      if (prev?.id !== docId) return prev
      const remaining = docs.filter((d) => d.id !== docId)
      return remaining[0] ?? null
    })
  }, [docs])

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Document Review"
        description="Review applicant documents, verify authenticity, and approve or request changes."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral-400" />
            <input
              type="text"
              placeholder="Search by applicant name..."
              aria-label="Search documents"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(searchValue)
              }}
              className="w-72 pl-9 pr-8 py-2 text-sm rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 placeholder:text-brand-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500"
            />
            {searchValue && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-neutral-400 hover:text-brand-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 flex-1 min-h-0">
        <ReviewQueue
          docs={docs}
          stats={stats}
          selectedId={selectedDoc?.id ?? null}
          onSelect={handleSelect}
        />

        {selectedDoc ? (
          <div className="flex flex-col gap-3 min-h-0">
            <DocumentViewer doc={selectedDoc} />
            <ReviewActions doc={selectedDoc} onStatusChange={handleStatusChange} />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-brand-neutral-200 bg-white">
            <p className="text-sm text-brand-neutral-400">All documents have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
