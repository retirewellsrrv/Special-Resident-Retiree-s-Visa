'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { updateDocumentStatus } from '@/actions/admin/documents'
import type { DocumentForReview } from '@/actions/admin/documents'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface Props {
  doc: DocumentForReview
  onStatusChange: (docId: number) => void
}

export function ReviewActions({ doc, onStatusChange }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(doc.status)
  const [reviewNote, setReviewNote] = useState(doc.review_note ?? '')
  const [noteOpen, setNoteOpen] = useState(false)

  // Reset local state when switching to a different document
  const [prevDocId, setPrevDocId] = useState(doc.id)
  if (doc.id !== prevDocId) {
    setPrevDocId(doc.id)
    setSelectedStatus(doc.status)
    setReviewNote(doc.review_note ?? '')
  }

  const needsNote = selectedStatus === 'rejected' || selectedStatus === 'action need'
  const statusChanged = selectedStatus !== doc.status
  const noteChanged = reviewNote !== (doc.review_note ?? '')
  const hasChanges = statusChanged || noteChanged

  function handleUpdate() {
    // Enforce review note for rejection or action-needed
    if (needsNote && !reviewNote.trim()) {
      toast.error('A review note is required when rejecting or requesting action from the applicant')
      // On mobile the note lives in a bottom sheet — surface it so the
      // required field is right in front of the admin.
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        setNoteOpen(true)
      }
      return
    }

    startTransition(async () => {
      const result = await updateDocumentStatus(doc.id, selectedStatus, reviewNote.trim() || null)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Document status updated')
      // Parent auto-advances to the next document in the queue
      onStatusChange(doc.id)
      router.refresh()
    })
  }

  return (
    <div>
      {/* ── Desktop card (lg+) ── */}
      <div className="hidden lg:block rounded-xl border border-brand-neutral-200 bg-white p-4">
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            {statusChanged && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
            )}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isPending}
              aria-label="Document status"
              className={`text-[16px] sm:text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40 ${
                statusChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200'
              }`}
            >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="action need">Action Need</option>
          </select>
          </div>
          <button
            onClick={handleUpdate}
            disabled={isPending || !hasChanges}
            className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            title={!hasChanges ? 'All changes saved' : 'Save changes'}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !hasChanges ? (
              <CheckCircle2 className="h-4 w-4 text-green-200" />
            ) : null}
            {isPending ? 'Saving...' : !hasChanges ? 'Saved' : 'Update'}
          </button>
        </div>

        {/* Review note */}
        <div className="mt-3">
          <label
            htmlFor="review-note"
            className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Review Note
            {needsNote && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="relative mt-1.5">
            {noteChanged && (
              <span className="absolute -left-3 top-3 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
            )}
            <textarea
              id="review-note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                selectedStatus === 'rejected'
                  ? 'Reason for rejection...'
                  : selectedStatus === 'action need'
                    ? 'What action is needed from the applicant...'
                    : 'Optional internal note...'
              }
              rows={3}
              disabled={isPending}
              className={`w-full text-[16px] sm:text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 placeholder:text-brand-neutral-300 disabled:opacity-40 ${
                noteChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200'
              }`}
            />
          </div>
          <p className="text-[11px] text-brand-neutral-400 mt-1">
            {needsNote
              ? 'A note is required for this status.'
              : 'Internal note visible to other admins.'}
          </p>
        </div>
      </div>

      {/* ── Mobile dock (< lg): status + save pinned at the bottom, note in a sheet ── */}
      <div className="lg:hidden rounded-xl border border-brand-neutral-200 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            {statusChanged && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
            )}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isPending}
              aria-label="Document status"
              className={cn(
                'w-full text-[16px] sm:text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40',
                statusChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200',
              )}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="action need">Action Need</option>
            </select>
          </div>
          <button
            onClick={handleUpdate}
            disabled={isPending || !hasChanges}
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            title={!hasChanges ? 'All changes saved' : 'Save changes'}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !hasChanges ? (
              <CheckCircle2 className="h-4 w-4 text-green-200" />
            ) : null}
            {isPending ? 'Saving...' : !hasChanges ? 'Saved' : 'Update'}
          </button>
        </div>

        <button
          onClick={() => setNoteOpen(true)}
          className={cn(
            'mt-2.5 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-brand-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 transition-colors',
            needsNote && 'border-red-300 text-red-700',
            noteChanged && !needsNote && 'border-amber-300 text-amber-700',
          )}
          aria-haspopup="dialog"
        >
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Review Note
            {needsNote && <span className="text-red-500">*</span>}
          </span>
          <ChevronDown className="h-4 w-4 text-brand-neutral-400" />
        </button>
      </div>

      {/* ── Mobile: review note bottom sheet ── */}
      <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
        <SheetContent side="bottom" className="px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] gap-0">
          <SheetHeader className="px-0 pt-0 pb-2">
            <SheetTitle>Review Note</SheetTitle>
            <SheetDescription>
              {needsNote
                ? 'A note is required for this status.'
                : 'Internal note visible to other admins.'}
            </SheetDescription>
          </SheetHeader>
          <div className="relative mt-2">
            {noteChanged && (
              <span className="absolute -left-3 top-3 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
            )}
            <textarea
              id="review-note-mobile"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                selectedStatus === 'rejected'
                  ? 'Reason for rejection...'
                  : selectedStatus === 'action need'
                    ? 'What action is needed from the applicant...'
                    : 'Optional internal note...'
              }
              rows={4}
              disabled={isPending}
              className="w-full text-[16px] rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 placeholder:text-brand-neutral-300 disabled:opacity-40"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}