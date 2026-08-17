'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Loader2, CheckCircle2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { StatusChip } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'
import { documentTypeLabel, type ReviewableDocument } from './document-meta'

/**
 * Desktop review rail: status dropdown + optional review note + save.
 * Saving is delegated to the parent via `onSave` so navigation/auto-advance
 * stays centralized. Rendered as a right-hand rail beside the preview
 * (scrollable body, pinned save bar).
 */

interface Props {
  doc: ReviewableDocument
  onSave: (docId: number, status: string, note: string) => Promise<boolean>
  className?: string
  /** External instruction to set the status dropdown (e.g. from a floating quick action) */
  prime?: { status: string; focusNote?: boolean } | null
  /** Called once the prime has been applied so the caller can clear it */
  onPrimeHandled?: () => void
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'action need', label: 'Action Needed' },
  { value: 'rejected', label: 'Rejected' },
]

export function DocumentActions({ doc, onSave, className, prime, onPrimeHandled }: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(doc.status)
  const [reviewNote, setReviewNote] = useState(doc.review_note ?? '')
  const noteRef = useRef<HTMLTextAreaElement>(null)

  // Apply external prime (e.g. floating Reject tapped without a note yet):
  // set the status dropdown and focus the note so the reason is entered.
  useEffect(() => {
    if (!prime) return
    setSelectedStatus(prime.status)
    if (prime.focusNote) {
      noteRef.current?.focus()
    }
    onPrimeHandled?.()
  }, [prime, onPrimeHandled])

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

  function handleSave() {
    // Enforce review note for rejection or action-needed
    if (needsNote && !reviewNote.trim()) {
      toast.error('A review note is required when rejecting or requesting action from the applicant')
      return
    }
    startTransition(async () => {
      await onSave(doc.id, selectedStatus, reviewNote.trim())
    })
  }

  return (
    <div className={cn('flex flex-col overflow-hidden min-h-0 bg-white rounded-xl border border-brand-neutral-200', className)}>
      {/* Scrollable decision controls */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Document metadata — desktop only; the mobile top bar already shows
            the doc type, applicant and status chip. */}
        <div className="hidden lg:block">
          <h4 className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider mb-2">
            Document Info
          </h4>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-brand-neutral-400">Type</dt>
              <dd className="text-brand-neutral-900 font-medium text-right">{documentTypeLabel(doc.type)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-brand-neutral-400">File</dt>
              <dd className="text-brand-neutral-900 truncate max-w-[150px] text-right">{doc.name}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-brand-neutral-400">Format</dt>
              <dd className="text-brand-neutral-900 uppercase text-right">{doc.format}</dd>
            </div>
            {doc.applicant_name && (
              <div className="flex justify-between gap-2">
                <dt className="text-brand-neutral-400">Applicant</dt>
                <dd className="text-brand-neutral-900 truncate max-w-[150px] text-right">{doc.applicant_name}</dd>
              </div>
            )}
            <div className="flex justify-between items-center gap-2">
              <dt className="text-brand-neutral-400">Status</dt>
              <dd>
                <StatusChip status={doc.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="hidden lg:block border-t border-brand-neutral-100 my-4" />

        {/* Status dropdown */}
        <div>
          <label
            htmlFor="doc-status"
            className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider flex items-center gap-1"
          >
            Status
            {needsNote && <span className="text-red-500">*</span>}
          </label>
          <div className="relative mt-1.5">
            {statusChanged && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
            )}
            <select
              id="doc-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isPending}
              aria-label="Document status"
              className={cn(
                'w-full text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40',
                statusChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200',
              )}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Review note */}
        <div className="mt-4">
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
              ref={noteRef}
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
              className={cn(
                'w-full text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 placeholder:text-brand-neutral-300 disabled:opacity-40',
                noteChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200',
              )}
            />
          </div>
          <p className="text-[11px] text-brand-neutral-400 mt-1">
            {needsNote
              ? 'A note is required for this status.'
              : 'Internal note visible to other admins.'}
          </p>
        </div>
      </div>

      {/* Pinned save bar */}
      <div className="p-3 border-t-2 border-brand-neutral-200 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className={cn(
            'inline-flex items-center gap-1.5 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-40',
            isPending || !hasChanges
              ? 'bg-brand-neutral-300 cursor-default'
              : 'bg-brand-primary-600 hover:bg-brand-primary-800',
          )}
          title={!hasChanges ? 'All changes saved' : 'Save changes'}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !hasChanges ? (
            <CheckCircle2 className="h-4 w-4 text-green-200" />
          ) : null}
          {isPending ? 'Saving...' : !hasChanges ? 'Saved' : 'Save Review'}
        </button>
      </div>
    </div>
  )
}
