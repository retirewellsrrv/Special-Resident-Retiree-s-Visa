'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateDocumentStatus } from '@/actions/admin/documents'
import type { DocumentForReview } from '@/actions/admin/documents'

interface Props {
  doc: DocumentForReview
  onStatusChange: (docId: number) => void
}

export function ReviewActions({ doc, onStatusChange }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(doc.status)

  function handleUpdate() {
    startTransition(async () => {
      const result = await updateDocumentStatus(doc.id, selectedStatus)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Document status updated')
      onStatusChange(doc.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-brand-neutral-200 bg-white p-4">
      <div className="flex items-center justify-end gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isPending}
          aria-label="Document status"
          className="text-sm rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="action need">Action Need</option>
        </select>
        <button
          onClick={handleUpdate}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update
        </button>
      </div>
    </div>
  )
}
